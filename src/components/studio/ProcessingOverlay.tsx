 import { Film, Sparkles } from 'lucide-react';
 import { STYLE_PRESETS } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 
 interface ProcessingOverlayProps {
   progress: number;
   message: string;
   config: { style: string };
 }
 
 export default function ProcessingOverlay({ progress, message, config }: ProcessingOverlayProps) {
   const styleName = STYLE_PRESETS.find(s => s.id === config.style)?.name || 'Custom';
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
       <div className="relative z-10 text-center space-y-4 animate-fade-in">
         <div className="relative w-20 h-20 mx-auto">
           <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-magenta opacity-20 blur-xl animate-pulse" />
           <div className="relative w-full h-full rounded-2xl bg-card border border-border/50 flex items-center justify-center glow-cyan">
             <Film className="w-8 h-8 text-primary" />
           </div>
         </div>
         <div>
           <h3 className="text-lg font-display font-bold flex items-center justify-center gap-2">
             <Sparkles className="w-4 h-4 text-primary" />Processing
           </h3>
           <p className="text-sm text-muted-foreground max-w-xs mx-auto">{message}</p>
         </div>
         <div className="w-48 mx-auto">
           <div className="h-1 bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${progress}%` }} />
           </div>
           <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
             <span>{styleName}</span>
             <span>{progress}%</span>
           </div>
         </div>
         <div className="flex justify-center gap-6 text-[10px] text-muted-foreground">
           {['Parse', 'Analyze', 'Edit', 'Export'].map((step, i) => (
             <div key={step} className={cn('flex items-center gap-1', progress > (i + 1) * 25 ? 'text-success' : progress > i * 25 ? 'text-primary' : '')}>
               <div className={cn('w-1.5 h-1.5 rounded-full', progress > (i + 1) * 25 ? 'bg-success' : progress > i * 25 ? 'bg-primary animate-pulse' : 'bg-muted-foreground')} />
               {step}
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }