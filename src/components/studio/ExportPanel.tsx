 import { EXPORT_FORMATS } from '@/lib/presets';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { cn } from '@/lib/utils';
 import { Download, Play, Loader2, CheckCircle, XCircle, FileOutput, Sparkles, Zap } from 'lucide-react';
 
 interface ExportPanelProps {
   exportFormat: string;
   onExportFormatChange: (format: string) => void;
   onGenerate: () => void;
   canGenerate: boolean;
   isProcessing: boolean;
   progress: number;
   statusMessage: string;
   processingState: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
 }
 
 export default function ExportPanel({ exportFormat, onExportFormatChange, onGenerate, canGenerate, isProcessing, progress, statusMessage, processingState }: ExportPanelProps) {
   return (
    <div className="space-y-5">
      {/* Export Format Selection */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-2xl" />
         <div className="panel-header">
          <div className="flex items-center gap-2">
            <FileOutput className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Export Format</span>
          </div>
          <span className="text-[9px] text-muted-foreground font-mono">NLE Compatible</span>
         </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
           {EXPORT_FORMATS.map((format) => {
             const active = exportFormat === format.id;
             return (
               <button
                 key={format.id}
                 onClick={() => onExportFormatChange(format.id)}
                 disabled={isProcessing}
                className={cn(
                  'preset-card text-left p-4 flex flex-col gap-2',
                  active && 'active'
                )}
               >
                <div className="flex items-center justify-between">
                  <p className={cn('text-xs font-semibold', active && 'text-primary')}>{format.name}</p>
                  {active && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">{format.extension}</p>
               </button>
             );
           })}
         </div>
       </div>
 
      {/* Processing Status */}
       {processingState !== 'idle' && (
        <div className={cn(
          'panel overflow-hidden',
          processingState === 'completed' && 'border-success/40',
          processingState === 'failed' && 'border-destructive/40'
        )}>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                processingState === 'completed' 
                  ? 'bg-success/10 border border-success/20' 
                  : processingState === 'failed'
                    ? 'bg-destructive/10 border border-destructive/20'
                    : 'bg-primary/10 border border-primary/20'
              )}>
                {processingState === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : processingState === 'failed' ? (
                  <XCircle className="w-5 h-5 text-destructive" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-semibold',
                  processingState === 'completed' && 'text-success',
                  processingState === 'failed' && 'text-destructive'
                )}>
                  {statusMessage}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">Progress</span>
                  <span className="text-[11px] font-mono font-bold text-foreground">{progress}%</span>
                </div>
              </div>
             </div>
            {isProcessing && (
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <div 
                  className="absolute top-0 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan" 
                  style={{ width: '30%' }}
                />
              </div>
            )}
           </div>
         </div>
       )}
 
      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={cn(
          'w-full h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300',
          canGenerate 
            ? 'btn-futuristic text-primary-foreground cursor-pointer' 
            : 'bg-muted border border-border/50 text-muted-foreground cursor-not-allowed'
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>AI Processing...</span>
            <span className="text-xs opacity-70 font-mono">{progress}%</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Sparkles className="w-5 h-5" />
              {canGenerate && (
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-5 h-5 opacity-50" />
                </div>
              )}
            </div>
            <span>Generate AI Edit</span>
            <Zap className="w-4 h-4" />
          </>
        )}
      </button>
      
      {/* Hint text */}
      {!canGenerate && !isProcessing && (
        <p className="text-center text-[10px] text-muted-foreground">
          Import an FCPXML file to start editing
        </p>
      )}
     </div>
   );
 }