 import { AI_MODELS } from '@/lib/presets';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Progress } from '@/components/ui/progress';
 import { Cpu, Zap, Settings, Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ControlPanelProps {
   model: string;
   onModelChange: (model: string) => void;
   styleRules: string;
   onStyleRulesChange: (rules: string) => void;
   onGenerate: () => void;
   canGenerate: boolean;
   isProcessing: boolean;
   processingState: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
   progress: number;
   statusMessage: string;
 }
 
 export default function ControlPanel({
   model,
   onModelChange,
   styleRules,
   onStyleRulesChange,
   onGenerate,
   canGenerate,
   isProcessing,
   processingState,
   progress,
   statusMessage,
 }: ControlPanelProps) {
   return (
     <div className="space-y-4">
       {/* AI Model Selection */}
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">AI Engine</span>
           <Cpu className="w-3.5 h-3.5 text-primary" />
         </div>
         <div className="p-4">
           <Select value={model} onValueChange={onModelChange} disabled={isProcessing}>
             <SelectTrigger className="w-full bg-muted/50 border-border/50 h-10">
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               {AI_MODELS.map((m) => (
                 <SelectItem key={m.id} value={m.id}>
                   <div className="flex items-center gap-2">
                     <div className={cn(
                       'w-2 h-2 rounded-full',
                       m.id.includes('flash') ? 'bg-success' : 
                       m.id.includes('pro') ? 'bg-primary' : 'bg-accent'
                     )} />
                     <span>{m.name}</span>
                   </div>
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           <p className="text-xs text-muted-foreground mt-2">
             {AI_MODELS.find(m => m.id === model)?.description}
           </p>
         </div>
       </div>
 
       {/* Style Rules */}
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">Edit Instructions</span>
           <Settings className="w-3.5 h-3.5 text-muted-foreground" />
         </div>
         <div className="p-4">
           <Textarea
             value={styleRules}
             onChange={(e) => onStyleRulesChange(e.target.value)}
             rows={8}
             className="font-mono text-xs leading-relaxed resize-none bg-muted/30 border-border/50 focus:border-primary/50"
             placeholder="Enter custom editing instructions..."
             disabled={isProcessing}
           />
           <div className="flex items-center justify-between mt-2">
             <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
               {styleRules.split('\n').filter(Boolean).length} rules defined
             </span>
           </div>
         </div>
       </div>
 
       {/* Status indicator */}
       {processingState !== 'idle' && (
         <div className={cn(
           'panel overflow-hidden',
           processingState === 'completed' && 'border-success/30',
           processingState === 'failed' && 'border-destructive/30'
         )}>
           <div className="p-4 space-y-3">
             <div className="flex items-center gap-3">
               {processingState === 'completed' ? (
                 <CheckCircle className="w-5 h-5 text-success" />
               ) : processingState === 'failed' ? (
                 <XCircle className="w-5 h-5 text-destructive" />
               ) : (
                 <Loader2 className="w-5 h-5 text-primary animate-spin" />
               )}
               <div className="flex-1">
                 <p className={cn(
                   'text-sm font-medium',
                   processingState === 'completed' && 'text-success',
                   processingState === 'failed' && 'text-destructive'
                 )}>
                   {statusMessage}
                 </p>
               </div>
               <span className="text-xs text-muted-foreground">{progress}%</span>
             </div>
             {isProcessing && (
               <Progress value={progress} className="h-1" />
             )}
           </div>
         </div>
       )}
 
       {/* Generate button */}
       <Button
         size="lg"
         onClick={onGenerate}
         disabled={!canGenerate}
         className={cn(
           'w-full h-12 gap-3 text-sm font-semibold transition-all',
           'bg-gradient-to-r from-primary to-accent text-primary-foreground',
           'hover:opacity-90 disabled:opacity-40',
           canGenerate && 'glow-cyan'
         )}
       >
         {isProcessing ? (
           <>
             <Loader2 className="w-5 h-5 animate-spin" />
             Processing Edit...
           </>
         ) : (
           <>
             <Play className="w-5 h-5" />
             Generate Rough Cut
           </>
         )}
       </Button>
     </div>
   );
 }