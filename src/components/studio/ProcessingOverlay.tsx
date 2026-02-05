 import { Film, Sparkles, Cpu, Zap, Wand2, CheckCircle } from 'lucide-react';
 import { STYLE_PRESETS } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 
 interface ProcessingOverlayProps {
   progress: number;
   message: string;
   config: { style: string };
 }
 
 export default function ProcessingOverlay({ progress, message, config }: ProcessingOverlayProps) {
   const styleName = STYLE_PRESETS.find(s => s.id === config.style)?.name || 'Custom';
  
  const steps = [
    { name: 'Parse', icon: Film, threshold: 25 },
    { name: 'Analyze', icon: Cpu, threshold: 50 },
    { name: 'Edit', icon: Wand2, threshold: 75 },
    { name: 'Export', icon: Sparkles, threshold: 100 },
  ];
 
   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop with gradient */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      
      {/* Radial gradient highlight */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" style={{ background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 60%)' }} />
      
      <div className="relative z-10 text-center space-y-8 animate-fade-in max-w-md mx-auto px-6">
        {/* Main icon with glow */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-accent to-magenta opacity-30 blur-2xl animate-pulse" />
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-magenta/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="relative w-full h-full rounded-3xl bg-card border border-primary/30 flex items-center justify-center glow-cyan overflow-hidden">
            <Film className="w-10 h-10 text-primary" />
            {/* Scan line effect */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan" style={{ top: '50%' }} />
            </div>
           </div>
         </div>
        
        {/* Title and message */}
        <div className="space-y-2">
          <h3 className="text-xl font-cyber font-bold flex items-center justify-center gap-3 tracking-wide">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-glow-cyan">AI Processing</span>
            <Zap className="w-5 h-5 text-primary animate-pulse" />
           </h3>
          <p className="text-sm text-muted-foreground">{message}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/40">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-xs text-muted-foreground">{styleName}</span>
          </div>
         </div>
        
        {/* Progress bar */}
        <div className="w-64 mx-auto space-y-2">
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden border border-border/30">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 rounded-full relative" 
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'holographic 3s ease infinite'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan" />
            </div>
           </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-bold text-primary">{progress}%</span>
           </div>
         </div>
        
        {/* Step indicators */}
        <div className="flex justify-center gap-8">
          {steps.map((step, i) => {
            const isComplete = progress >= step.threshold;
            const isActive = progress > (i === 0 ? 0 : steps[i - 1].threshold) && progress < step.threshold;
            const Icon = step.icon;
            
            return (
              <div key={step.name} className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300',
                  isComplete 
                    ? 'bg-success/20 border-success/50 text-success' 
                    : isActive 
                      ? 'bg-primary/20 border-primary/50 text-primary animate-pulse glow-cyan-sm' 
                      : 'bg-muted/30 border-border/40 text-muted-foreground'
                )}>
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className={cn('w-5 h-5', isActive && 'animate-pulse')} />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium uppercase tracking-wider transition-colors',
                  isComplete ? 'text-success' : isActive ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* AI badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Powered by OpenAI & Gemini</span>
            <Cpu className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
       </div>
     </div>
   );
 }