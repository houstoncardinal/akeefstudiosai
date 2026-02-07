import { Download, Copy, Check, RotateCcw, FileCode, Sparkles, CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { EXPORT_FORMATS } from '@/lib/presets';
import { type ExportRecord } from '@/hooks/useExportHistory';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';
import ExportDialog from './ExportDialog';

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
  file?: File | null;
  videoRef?: React.RefObject<HTMLVideoElement>;
  effectsCanvas?: HTMLCanvasElement | null;
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

  // Video formats - browser can only reliably output WebM
  return { mime: 'video/webm', ext: '.webm', description: 'WebM Video', isProjectFile: false };
}

export default function OutputPanel({ 
  job, 
  outputXml, 
  onNewEdit, 
  config, 
  showOutput, 
  onExportSaved,
  file,
  videoRef,
  effectsCanvas 
}: OutputPanelProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Create a default ref if none provided
  const defaultVideoRef = useRef<HTMLVideoElement>(null);
  const actualVideoRef = videoRef || defaultVideoRef;

  const selectedFormat = EXPORT_FORMATS.find(f => f.id === config.exportFormat);
  const meta = getFormatMeta(config.exportFormat);

  const baseName = job?.input_filename?.replace(/\.[^.]+$/, '') || file?.name?.replace(/\.[^.]+$/, '') || 'akeef_export';
  const outputFilename = `${baseName}${meta.ext}`;

  const handleCopy = async () => {
    if (!outputXml) return;
    await navigator.clipboard.writeText(outputXml);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProjectExport = async () => {
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
          content: btoa(outputXml),
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
      content: btoa(outputXml),
    });

    toast({ title: 'Download started!', description: outputFilename });
  };

  const handleQuickDownload = () => {
    if (!outputXml) return;
    
    // For video formats, open the export dialog
    if (!meta.isProjectFile) {
      setShowExportDialog(true);
      return;
    }
    
    // For project files, download directly
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
      content: btoa(outputXml),
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
    <>
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
                Ready as {meta.isProjectFile ? selectedFormat?.name || 'FCPXML' : 'Project File'} ({meta.ext})
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

          {/* Video format notice */}
          {!meta.isProjectFile && (
            <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-warning">
                  <strong>Video Export:</strong> Use the Export dialog for playable video files, or download the project file for rendering in professional software.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            {/* Primary: Export Dialog for video formats, Save As for project files */}
            <InsightTooltip hint={FEATURE_TOOLTIPS['output-save']} side="top">
              <Button
                onClick={() => meta.isProjectFile ? handleProjectExport() : setShowExportDialog(true)}
                className="w-full h-11 gap-2 text-xs font-semibold bg-gradient-to-r from-success to-primary hover:opacity-90"
              >
                <Save className="w-4 h-4" />
                {meta.isProjectFile ? `Save As... (${outputFilename})` : 'Export Video...'}
              </Button>
            </InsightTooltip>

            {/* Secondary row */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickDownload}
                className="h-9 gap-1.5 text-[11px] border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                <Download className="w-3.5 h-3.5" />
                {meta.isProjectFile ? 'Quick Download' : 'Download Project'}
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
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Project File Preview</span>
              <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[140px]">{baseName}.fcpxml</span>
            </div>
            <ScrollArea className="h-32 sm:h-36 rounded-lg border border-border/40 bg-background/50">
              <pre className="p-3 text-[9px] font-mono text-primary/70 leading-relaxed">
                {outputXml?.slice(0, 1500)}...
              </pre>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        file={file || null}
        videoRef={actualVideoRef}
        effectsCanvas={effectsCanvas || null}
        outputXml={outputXml}
        formatId={config.exportFormat}
        config={config}
        onExportComplete={(record) => {
          onExportSaved?.(record);
        }}
      />
    </>
  );
}
