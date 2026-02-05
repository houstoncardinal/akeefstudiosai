 import { Film, Sparkles, Loader2 } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { EDIT_PRESETS } from '@/lib/presets';
 
 interface ProcessingOverlayProps {
   progress: number;
   message: string;
   preset: string;
 }
 
 export default function ProcessingOverlay({ progress, message, preset }: ProcessingOverlayProps) {
   const presetName = EDIT_PRESETS.find(p => p.id === preset)?.name || 'Custom';
   
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
       
       {/* Content */}
       <div className="relative z-10 text-center space-y-6 animate-fade-in">
         {/* Animated logo */}
         <div className="relative w-24 h-24 mx-auto">
           <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-magenta opacity-20 blur-xl animate-pulse" />
           <div className="relative w-full h-full rounded-2xl bg-card border border-border/50 flex items-center justify-center glow-cyan">
             <Film className="w-10 h-10 text-primary" />
             <div className="absolute inset-0 rounded-2xl overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
             </div>
           </div>
           {/* Orbiting dots */}
           <div className="absolute inset-0 animate-spin-slow">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-2 h-2 rounded-full bg-primary" />
           </div>
           <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-2 h-2 rounded-full bg-accent" />
           </div>
         </div>
 
         {/* Text content */}
         <div className="space-y-2">
           <h3 className="text-xl font-display font-bold text-foreground flex items-center justify-center gap-2">
             <Sparkles className="w-5 h-5 text-primary" />
             AI Processing
           </h3>
           <p className="text-sm text-muted-foreground max-w-xs mx-auto">
             {message}
           </p>
         </div>
 
         {/* Progress bar */}
         <div className="w-64 mx-auto space-y-2">
           <div className="h-1.5 bg-muted rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-pulse rounded-full transition-all duration-300"
               style={{ width: `${progress}%` }}
             />
           </div>
           <div className="flex items-center justify-between text-xs text-muted-foreground">
             <span>{presetName}</span>
             <span>{progress}%</span>
           </div>
         </div>
 
         {/* Processing steps */}
         <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground">
           <div className={cn(
             'flex items-center gap-1.5',
             progress > 20 ? 'text-success' : 'text-muted-foreground'
           )}>
             <div className={cn(
               'w-1.5 h-1.5 rounded-full',
               progress > 20 ? 'bg-success' : 'bg-muted-foreground'
             )} />
             Parse
           </div>
           <div className={cn(
             'flex items-center gap-1.5',
             progress > 50 ? 'text-success' : progress > 20 ? 'text-primary' : 'text-muted-foreground'
           )}>
             <div className={cn(
               'w-1.5 h-1.5 rounded-full',
               progress > 50 ? 'bg-success' : progress > 20 ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
             )} />
             Analyze
           </div>
           <div className={cn(
             'flex items-center gap-1.5',
             progress > 80 ? 'text-success' : progress > 50 ? 'text-primary' : 'text-muted-foreground'
           )}>
             <div className={cn(
               'w-1.5 h-1.5 rounded-full',
               progress > 80 ? 'bg-success' : progress > 50 ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
             )} />
             Edit
           </div>
           <div className={cn(
             'flex items-center gap-1.5',
             progress >= 100 ? 'text-success' : progress > 80 ? 'text-primary' : 'text-muted-foreground'
           )}>
             <div className={cn(
               'w-1.5 h-1.5 rounded-full',
               progress >= 100 ? 'bg-success' : progress > 80 ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
             )} />
             Export
           </div>
         </div>
       </div>
     </div>
   );
 }