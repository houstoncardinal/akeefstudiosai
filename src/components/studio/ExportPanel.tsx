 import { EXPORT_FORMATS } from '@/lib/presets';
 import { Button } from '@/components/ui/button';
 import { Progress } from '@/components/ui/progress';
 import { cn } from '@/lib/utils';
 import { Download, Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
 
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
     <div className="space-y-4">
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">Export Format</span>
           <Download className="w-3.5 h-3.5 text-primary" />
         </div>
         <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
           {EXPORT_FORMATS.map((format) => {
             const active = exportFormat === format.id;
             return (
               <button
                 key={format.id}
                 onClick={() => onExportFormatChange(format.id)}
                 disabled={isProcessing}
                 className={cn('preset-card text-left p-3', active && 'active')}
               >
                 <p className={cn('text-xs font-medium', active && 'text-primary')}>{format.name}</p>
                 <p className="text-[9px] text-muted-foreground font-mono">{format.extension}</p>
               </button>
             );
           })}
         </div>
       </div>
 
       {processingState !== 'idle' && (
         <div className={cn('panel', processingState === 'completed' && 'border-success/30', processingState === 'failed' && 'border-destructive/30')}>
           <div className="p-3 space-y-2">
             <div className="flex items-center gap-2">
               {processingState === 'completed' ? <CheckCircle className="w-4 h-4 text-success" /> :
                processingState === 'failed' ? <XCircle className="w-4 h-4 text-destructive" /> :
                <Loader2 className="w-4 h-4 text-primary animate-spin" />}
               <span className="text-xs flex-1">{statusMessage}</span>
               <span className="text-[10px] text-muted-foreground">{progress}%</span>
             </div>
             {isProcessing && <Progress value={progress} className="h-1" />}
           </div>
         </div>
       )}
 
       <Button onClick={onGenerate} disabled={!canGenerate} className={cn('w-full h-12 gap-2 text-sm font-semibold bg-gradient-to-r from-primary to-accent', canGenerate && 'glow-cyan')}>
         {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <><Play className="w-5 h-5" />Generate All Versions</>}
       </Button>
     </div>
   );
 }