import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Download,
  FileVideo,
  FileCode,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HardDrive,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { EXPORT_FORMATS, type ExportFormat } from '@/lib/presets';
import { useVideoRenderer, type RenderProgress } from '@/hooks/useVideoRenderer';
import { type ExportRecord } from '@/hooks/useExportHistory';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  effectsCanvas: HTMLCanvasElement | null;
  outputXml: string | null;
  formatId: string;
  config: {
    style: string;
    colorGrade: string;
    model: string;
  };
  onExportComplete: (record: Omit<ExportRecord, 'id' | 'createdAt'>) => void;
}

type ExportType = 'project' | 'video' | 'quickvideo';

export default function ExportDialog({
  open,
  onOpenChange,
  file,
  videoRef,
  effectsCanvas,
  outputXml,
  formatId,
  config,
  onExportComplete,
}: ExportDialogProps) {
  const { toast } = useToast();
  const { isRendering, renderProgress, renderVideo, quickExportVideo, cancelRender } = useVideoRenderer();
  const [exportType, setExportType] = useState<ExportType | null>(null);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  const format = EXPORT_FORMATS.find(f => f.id === formatId);
  const isProjectFormat = format?.codec === 'N/A';
  const isVideoFormat = !isProjectFormat;

  const baseName = file?.name?.replace(/\.[^.]+$/, '') || 'akeef_export';

  useEffect(() => {
    if (!open) {
      setExportType(null);
      setExportBlob(null);
    }
  }, [open]);

  const getFormatMeta = () => {
    if (!format) return { ext: '.fcpxml', mime: 'application/xml' };
    
    // Video formats - we can only reliably output WebM from browser
    if (isVideoFormat) {
      return { ext: '.webm', mime: 'video/webm' };
    }
    
    // Project formats
    switch (formatId) {
      case 'edl': return { ext: '.edl', mime: 'text/plain' };
      case 'aaf': return { ext: '.aaf', mime: 'application/octet-stream' };
      default: return { ext: format.extension, mime: 'application/xml' };
    }
  };

  const handleProjectExport = async () => {
    if (!outputXml) {
      toast({ variant: 'destructive', title: 'No edit data', description: 'Generate an AI edit first' });
      return;
    }

    const meta = getFormatMeta();
    const filename = `${baseName}_edited${meta.ext}`;
    const blob = new Blob([outputXml], { type: meta.mime });
    
    // Download immediately
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    onExportComplete({
      filename,
      formatId,
      formatName: format?.name || 'FCPXML',
      extension: meta.ext,
      style: config.style,
      model: config.model,
      colorGrade: config.colorGrade,
      sizeBytes: blob.size,
      content: btoa(outputXml),
    });

    toast({ title: 'Project file exported!', description: filename });
    onOpenChange(false);
  };

  const handleVideoExport = async (quick: boolean = false) => {
    if (!file) {
      toast({ variant: 'destructive', title: 'No video file', description: 'Upload a video first' });
      return;
    }

    setExportType(quick ? 'quickvideo' : 'video');

    let blob: Blob | null = null;
    
    if (quick) {
      // Quick export - just use original file
      blob = await quickExportVideo(file);
    } else {
      // Full render with effects
      if (!videoRef.current) {
        toast({ variant: 'destructive', title: 'Video not loaded', description: 'Please wait for video to load' });
        return;
      }
      blob = await renderVideo(videoRef.current, effectsCanvas, {
        format: 'webm',
        width: 1920,
        height: 1080,
        frameRate: 30,
      });
    }

    if (blob) {
      setExportBlob(blob);
    }
  };

  const handleDownloadRenderedVideo = () => {
    if (!exportBlob) return;

    const meta = getFormatMeta();
    const filename = `${baseName}_edited${meta.ext}`;
    
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    onExportComplete({
      filename,
      formatId: 'webm_vp9', // Browser can only output WebM
      formatName: 'WebM VP9',
      extension: '.webm',
      style: config.style,
      model: config.model,
      colorGrade: config.colorGrade,
      sizeBytes: exportBlob.size,
    });

    toast({ title: 'Video exported!', description: filename });
    onOpenChange(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Your Edit
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to export your AI-edited content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format info */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Selected Format</span>
              <Badge variant="outline" className="font-mono">
                {format?.name || 'FCPXML'} ({format?.extension || '.fcpxml'})
              </Badge>
            </div>
          </div>

          {/* Project File Export Option */}
          {outputXml && (
            <button
              onClick={handleProjectExport}
              disabled={isRendering}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 hover:bg-primary/5',
                'flex items-start gap-4',
                isRendering && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <FileCode className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">Project File</span>
                  <Badge variant="secondary" className="text-[9px]">Instant</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Download editable {isProjectFormat ? format?.name : 'FCPXML'} file for Final Cut Pro, Premiere, DaVinci Resolve
                </p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    ~{formatBytes(outputXml.length)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    With AI edit decisions
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Video Export Options */}
          {file && isVideoFormat && (
            <>
              {/* Quick Video Export */}
              <button
                onClick={() => handleVideoExport(true)}
                disabled={isRendering}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all hover:border-success/50 hover:bg-success/5',
                  'flex items-start gap-4',
                  isRendering && exportType !== 'quickvideo' && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Quick Video Export</span>
                    <Badge className="bg-success text-white text-[9px]">Fast</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Export original video quickly (no effects applied)
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {formatBytes(file.size)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Instant
                    </span>
                  </div>
                </div>
                {exportType === 'quickvideo' && renderProgress?.stage === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Full Render Export */}
              <button
                onClick={() => handleVideoExport(false)}
                disabled={isRendering}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 hover:bg-primary/5',
                  'flex items-start gap-4',
                  isRendering && exportType !== 'video' && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <FileVideo className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Render with Effects</span>
                    <Badge variant="secondary" className="text-[9px]">WebM</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Render video with color grading and effects applied
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Takes longer
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Full quality
                    </span>
                  </div>
                </div>
                {exportType === 'video' && renderProgress?.stage === 'complete' ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </>
          )}

          {/* Rendering Progress */}
          {isRendering && renderProgress && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm font-medium">{renderProgress.message}</span>
                </div>
                <span className="text-sm font-mono text-primary">{renderProgress.progress}%</span>
              </div>
              <Progress value={renderProgress.progress} className="h-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={cancelRender}
                className="w-full text-xs"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Render Complete - Download Button */}
          {exportBlob && renderProgress?.stage === 'complete' && (
            <div className="p-4 rounded-lg bg-success/10 border border-success/30 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-semibold text-success">Export Ready!</span>
                <Badge variant="outline" className="ml-auto">
                  {formatBytes(exportBlob.size)}
                </Badge>
              </div>
              <Button
                onClick={handleDownloadRenderedVideo}
                className="w-full h-11 gap-2 bg-gradient-to-r from-success to-primary"
              >
                <Download className="w-5 h-5" />
                Download Video
              </Button>
            </div>
          )}

          {/* Render Failed */}
          {renderProgress?.stage === 'failed' && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">{renderProgress.message}</span>
              </div>
            </div>
          )}

          {/* Browser Limitation Notice */}
          {isVideoFormat && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-warning">
                  <strong>Note:</strong> Browser-based video export is limited to WebM format. 
                  For MP4/ProRes exports, download the project file and render in professional software 
                  like Final Cut Pro, Premiere Pro, or DaVinci Resolve.
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
