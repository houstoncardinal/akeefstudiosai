import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  Save,
  Sparkles,
  CheckCircle,
  Loader2,
  FolderDown,
  FileCode,
  Wand2,
  Zap,
  HardDrive,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { EXPORT_FORMATS } from '@/lib/presets';

interface QuickExportBarProps {
  outputXml: string | null;
  isProcessing: boolean;
  progress: number;
  canGenerate: boolean;
  exportFormat: string;
  onGenerate: () => void;
  onExport: (filename: string) => void;
  inputFilename?: string;
}

const QuickExportBar = forwardRef<HTMLDivElement, QuickExportBarProps>(({
  outputXml,
  isProcessing,
  progress,
  canGenerate,
  exportFormat,
  onGenerate,
  onExport,
  inputFilename,
}, ref) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customFilename, setCustomFilename] = useState('');

  const selectedFormat = EXPORT_FORMATS.find((f) => f.id === exportFormat);
  const isProjectFormat = selectedFormat?.codec === 'N/A';
  
  // For quick export, we always output project files (FCPXML)
  // Video rendering requires the full Export Dialog
  const ext = isProjectFormat ? (selectedFormat?.extension || '.fcpxml') : '.fcpxml';
  const baseName = inputFilename?.replace(/\.[^.]+$/, '') || 'akeef_export';
  const suggestedFilename = `${baseName}_edited${ext}`;

  const handleQuickExport = () => {
    onExport(suggestedFilename);
  };

  const handleSaveAs = () => {
    const filename = customFilename.trim() || suggestedFilename;
    const finalName = filename.endsWith(ext) ? filename : `${filename}${ext}`;
    onExport(finalName);
    setShowSaveDialog(false);
    setCustomFilename('');
  };

  // Estimate file size based on format
  const getEstimatedSize = () => {
    // Project files are typically small
    return '~50 KB';
  };

  if (!canGenerate && !outputXml && !isProcessing) {
    return null;
  }

  return (
    <>
      {/* Floating Export Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <div className={cn(
            'pointer-events-auto rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300',
            outputXml 
              ? 'bg-gradient-to-r from-success/10 via-card/95 to-primary/10 border-success/30' 
              : 'bg-card/95 border-border/50'
          )}>
            {/* Progress bar when processing */}
            {isProcessing && (
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    <span className="text-sm font-medium">AI Processing...</span>
                  </div>
                  <span className="text-sm font-mono text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            <div className="flex items-center gap-4 p-4">
              {/* Left: Status / Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {outputXml ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-success/20 border border-success/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-success">Ready to Export</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[9px]">
                          <FileCode className="w-2.5 h-2.5 mr-1" />
                          {isProjectFormat ? selectedFormat?.name : 'FCPXML Project'}
                        </Badge>
                        <span>•</span>
                        <span className="truncate">{suggestedFilename}</span>
                      </div>
                    </div>
                  </>
                ) : isProcessing ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Creating Your Edit</p>
                      <p className="text-xs text-muted-foreground">AI is working its magic...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Ready to Generate</p>
                      <p className="text-xs text-muted-foreground">Click to create your AI-powered edit</p>
                    </div>
                  </>
                )}
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {outputXml ? (
                  <>
                    {/* Quick Export - One Click */}
                    <Button
                      onClick={handleQuickExport}
                      size="lg"
                      className="h-12 px-6 gap-2 bg-gradient-to-r from-success to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Quick Export
                      <Badge variant="secondary" className="ml-1 bg-white/20 text-white text-[9px]">
                        Project
                      </Badge>
                    </Button>

                    {/* Save As - Custom Name */}
                    <Button
                      variant="outline"
                      onClick={() => setShowSaveDialog(true)}
                      className="h-12 px-4 gap-2 border-primary/30 hover:bg-primary/10"
                    >
                      <Save className="w-4 h-4" />
                      Save As...
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onGenerate}
                    disabled={!canGenerate || isProcessing}
                    size="lg"
                    className={cn(
                      'h-12 px-8 gap-3 font-semibold transition-all',
                      canGenerate && !isProcessing
                        ? 'btn-premium text-white shadow-lg hover:shadow-xl'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate AI Edit
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save As Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-primary" />
              Save Your Edit
            </DialogTitle>
            <DialogDescription>
              Choose a name for your exported project file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Filename Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filename</label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={suggestedFilename.replace(ext, '')}
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  className="flex-1"
                />
                <Badge variant="outline" className="flex-shrink-0 font-mono">
                  {ext}
                </Badge>
              </div>
            </div>

            {/* Format Info */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  {isProjectFormat ? selectedFormat?.name : 'FCPXML Project File'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  Est. Size
                </span>
                <span className="font-medium">{getEstimatedSize()}</span>
              </div>
            </div>

            {/* Note about video formats */}
            {!isProjectFormat && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-accent">
                    <strong>Tip:</strong> For rendered video (MP4/WebM), use the Export button in the Output panel. 
                    This downloads the project file for editing in Final Cut Pro, Premiere, or DaVinci Resolve.
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSaveAs}
              className="w-full h-12 gap-2 bg-gradient-to-r from-success to-primary text-white font-semibold"
            >
              <Download className="w-5 h-5" />
              Save to Computer
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

QuickExportBar.displayName = 'QuickExportBar';

export default QuickExportBar;
