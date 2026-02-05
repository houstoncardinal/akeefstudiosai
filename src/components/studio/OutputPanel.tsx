import { Download, Copy, Check, RotateCcw, FileCode, Sparkles, CheckCircle, FolderDown, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { EXPORT_FORMATS } from '@/lib/presets';
import { type ExportRecord } from '@/hooks/useExportHistory';

interface JobData {
  id: string;
  input_filename: string;
  output_filename: string | null;
  output_file_path: string | null;
  preset: string;
  model: string;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

interface OutputPanelProps {
  job: JobData | null;
  outputXml: string | null;
  onNewEdit: () => void;
  config: {
    style: string;
    colorGrade: string;
    effectPreset: string;
    graphics: string[];
    versions: string[];
    exportFormat: string;
    model: string;
    customRules: string;
    formatTools: string[];
    transitions: string[];
    shotAnalysisRules: Record<string, string[]>;
    beatRules: string[];
    directorIntent: string | null;
    customIntent: string;
  };
  showOutput: boolean;
  onExportSaved?: (record: Omit<ExportRecord, 'id' | 'createdAt'>) => void;
}

/** MIME type & file-picker config per format category */
function getFormatMeta(formatId: string) {
  const fmt = EXPORT_FORMATS.find(f => f.id === formatId);
  if (!fmt) return { mime: 'application/xml', ext: '.fcpxml', description: 'Final Cut Pro XML', isProjectFile: true };

  const isProjectFile = fmt.codec === 'N/A';
  const ext = fmt.extension;

  if (isProjectFile) {
    switch (formatId) {
      case 'edl':
        return { mime: 'text/plain', ext, description: 'Edit Decision List', isProjectFile: true };
      case 'aaf':
        return { mime: 'application/octet-stream', ext, description: 'Avid AAF', isProjectFile: true };
      default:
        return { mime: 'application/xml', ext, description: fmt.name, isProjectFile: true };
    }
  }

  // Video formats
  switch (formatId) {
    case 'mp4_h264':
    case 'mp4_hevc':
      return { mime: 'video/mp4', ext, description: fmt.name, isProjectFile: false };
    case 'mov_prores':
    case 'mov_prores_4444':
      return { mime: 'video/quicktime', ext, description: fmt.name, isProjectFile: false };
    case 'webm_vp9':
      return { mime: 'video/webm', ext, description: fmt.name, isProjectFile: false };
    case 'dnxhd':
      return { mime: 'application/mxf', ext, description: fmt.name, isProjectFile: false };
    case 'avi_uncompressed':
      return { mime: 'video/x-msvideo', ext, description: fmt.name, isProjectFile: false };
    default:
      return { mime: 'application/octet-stream', ext, description: fmt.name, isProjectFile: false };
  }
}

export default function OutputPanel({ job, outputXml, onNewEdit, config, showOutput, onExportSaved }: OutputPanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const selectedFormat = EXPORT_FORMATS.find(f => f.id === config.exportFormat);
  const meta = getFormatMeta(config.exportFormat);

  const baseName = job?.input_filename?.replace(/\.[^.]+$/, '') || 'akeef_export';
  const outputFilename = `${baseName}${meta.ext}`;

  const handleCopy = async () => {
    if (!outputXml) return;
    await navigator.clipboard.writeText(outputXml);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAs = async () => {
    if (!outputXml) return;
    const blob = new Blob([outputXml], { type: meta.mime });

    // Try File System Access API for native save-as dialog
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: outputFilename,
          types: [
            {
              description: meta.description,
              accept: { [meta.mime]: [meta.ext] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        toast({ title: 'File saved successfully!', description: handle.name });

        // Log to export history
        onExportSaved?.({
          filename: handle.name,
          formatId: config.exportFormat,
          formatName: selectedFormat?.name || config.exportFormat,
          extension: meta.ext,
          style: config.style,
          model: config.model,
          colorGrade: config.colorGrade,
          sizeBytes: blob.size,
          content: meta.isProjectFile ? btoa(outputXml) : undefined,
        });
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    // Fallback: auto-download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFilename;
    a.click();
    URL.revokeObjectURL(url);

    onExportSaved?.({
      filename: outputFilename,
      formatId: config.exportFormat,
      formatName: selectedFormat?.name || config.exportFormat,
      extension: meta.ext,
      style: config.style,
      model: config.model,
      colorGrade: config.colorGrade,
      sizeBytes: blob.size,
      content: meta.isProjectFile ? btoa(outputXml) : undefined,
    });

    toast({ title: 'Download started!', description: outputFilename });
  };

  const handleQuickDownload = () => {
    if (!outputXml) return;
    const blob = new Blob([outputXml], { type: meta.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFilename;
    a.click();
    URL.revokeObjectURL(url);

    onExportSaved?.({
      filename: outputFilename,
      formatId: config.exportFormat,
      formatName: selectedFormat?.name || config.exportFormat,
      extension: meta.ext,
      style: config.style,
      model: config.model,
      colorGrade: config.colorGrade,
      sizeBytes: blob.size,
      content: meta.isProjectFile ? btoa(outputXml) : undefined,
    });

    toast({ title: 'Download started!', description: outputFilename });
  };

  if (!showOutput) {
    return (
      <div className="panel h-full relative overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Output</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-52 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
            <FileCode className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No output yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Configure your edit and click Generate</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel border-success/40 h-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent pointer-events-none" />

      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="status-dot bg-success" />
          <span className="panel-title text-success">Ready to Export</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onNewEdit} className="h-7 text-[10px] gap-1.5">
          <RotateCcw className="w-3 h-3 mr-1" />New
        </Button>
      </div>
      <div className="p-3 sm:p-4 space-y-4 relative">
        {/* Success banner */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-success">AI Edit Complete</p>
            <p className="text-[10px] text-success/70 truncate">
              Ready as {selectedFormat?.name || 'FCPXML'} ({meta.ext})
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-success/50 flex-shrink-0" />
        </div>

        {/* Format info */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
            {selectedFormat?.name || 'FCPXML'}
          </Badge>
          <Badge variant="outline" className="text-[9px]">
            {meta.ext}
          </Badge>
          {selectedFormat && selectedFormat.codec !== 'N/A' && (
            <Badge variant="outline" className="text-[9px]">
              {selectedFormat.codec}
            </Badge>
          )}
          {selectedFormat && selectedFormat.resolution !== 'Source' && (
            <Badge variant="outline" className="text-[9px]">
              {selectedFormat.resolution}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {/* Primary: Save As (choose location) */}
          <Button
            onClick={handleSaveAs}
            className="w-full h-11 gap-2 text-xs font-semibold bg-gradient-to-r from-success to-primary hover:opacity-90"
          >
            <Save className="w-4 h-4" />
            Save As... ({outputFilename})
          </Button>

          {/* Secondary row */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickDownload}
              className="h-9 gap-1.5 text-[11px] border-border/50 hover:border-primary/50 hover:bg-primary/5"
            >
              <Download className="w-3.5 h-3.5" />
              Quick Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-9 gap-1.5 text-[11px] border-border/50 hover:border-primary/50 hover:bg-primary/5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy XML'}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Output Preview</span>
            <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[140px]">{outputFilename}</span>
          </div>
          <ScrollArea className="h-32 sm:h-36 rounded-lg border border-border/40 bg-background/50">
            <pre className="p-3 text-[9px] font-mono text-primary/70 leading-relaxed">
              {outputXml?.slice(0, 1500)}...
            </pre>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
