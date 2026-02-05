import { EXPORT_FORMATS, type ExportFormat } from '@/lib/presets';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Download, Loader2, CheckCircle, XCircle, FileOutput, Sparkles, Zap, Film, FileVideo, Video, HelpCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';
 
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
  // Group formats by type
  const videoFormats = EXPORT_FORMATS.filter(f => 
    ['mp4_h264', 'mp4_hevc', 'mov_prores', 'mov_prores_4444', 'dnxhd', 'webm_vp9', 'avi_uncompressed'].includes(f.id)
  );
  const projectFormats = EXPORT_FORMATS.filter(f => 
    ['fcpxml', 'premiere_xml', 'davinci_xml', 'edl', 'aaf'].includes(f.id)
  );

  const getFormatIcon = (format: ExportFormat) => {
    if (format.codec === 'N/A') return FileOutput;
    return FileVideo;
  };

   return (
   <div className="space-y-4">
      {/* Export Format Selection */}
      <div className="panel relative overflow-hidden">
         <div className="panel-header">
          <div className="flex items-center gap-2">
            <FileOutput className="w-3.5 h-3.5 text-accent" />
           <span className="panel-title">Output Format</span>
           <InsightTooltip hint={FEATURE_TOOLTIPS['export-format']} side="right">
             <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
           </InsightTooltip>
          </div>
         <span className="text-[9px] text-muted-foreground font-mono">Video & Project Files</span>
         </div>
       <ScrollArea className="h-64">
         <div className="p-4 space-y-4">
           {/* Video Formats */}
           <div>
             <div className="flex items-center gap-2 mb-2">
               <Video className="w-3.5 h-3.5 text-primary" />
               <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Video Formats</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
               {videoFormats.map((format) => {
                 const active = exportFormat === format.id;
                 const Icon = getFormatIcon(format);
                 return (
                   <button
                     key={format.id}
                     onClick={() => onExportFormatChange(format.id)}
                     disabled={isProcessing}
                     className={cn(
                       'preset-card text-left p-3 flex flex-col gap-1.5',
                       active && 'active'
                     )}
                   >
                     <div className="flex items-center justify-between">
                       <p className={cn('text-xs font-semibold', active && 'text-primary')}>{format.name}</p>
                       {active && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                     </div>
                     <div className="flex items-center gap-2 flex-wrap">
                       <span className="text-[9px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">{format.extension}</span>
                       <span className="text-[9px] text-muted-foreground">{format.resolution}</span>
                     </div>
                     <p className="text-[9px] text-muted-foreground">{format.codec} • {format.bitrate}</p>
                   </button>
                 );
               })}
             </div>
           </div>

           {/* Project Formats */}
           <div>
             <div className="flex items-center gap-2 mb-2">
               <Film className="w-3.5 h-3.5 text-accent" />
               <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Project Files</span>
             </div>
             <div className="grid grid-cols-2 gap-2">
               {projectFormats.map((format) => {
                 const active = exportFormat === format.id;
                 return (
                   <button
                     key={format.id}
                     onClick={() => onExportFormatChange(format.id)}
                     disabled={isProcessing}
                     className={cn(
                       'preset-card text-left p-3 flex flex-col gap-1',
                       active && 'active'
                     )}
                   >
                     <div className="flex items-center justify-between">
                       <p className={cn('text-xs font-semibold', active && 'text-primary')}>{format.name}</p>
                       {active && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                     </div>
                     <span className="text-[9px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded w-fit">{format.extension}</span>
                   </button>
                 );
               })}
             </div>
           </div>
         </div>
       </ScrollArea>
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
      <InsightTooltip hint={FEATURE_TOOLTIPS['export-generate']} side="top" disabled={isProcessing}>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={cn(
            'w-full h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300',
            canGenerate 
              ? 'btn-premium text-primary-foreground cursor-pointer' 
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
      </InsightTooltip>
      
      {/* Hint text */}
      {!canGenerate && !isProcessing && (
        <p className="text-center text-[10px] text-muted-foreground">
          Import an FCPXML file to start editing
        </p>
      )}
     </div>
   );
 }