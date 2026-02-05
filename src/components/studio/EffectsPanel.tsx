 import { EFFECT_PRESETS } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Zap, Film, Minimize2, Clock, Activity, CheckCircle, Sparkles } from 'lucide-react';
 
 interface EffectsPanelProps {
   effectPreset: string;
   onEffectPresetChange: (preset: string) => void;
   disabled?: boolean;
 }
 
 const icons: Record<string, typeof Zap> = {
   hype_mode: Zap,
   cinematic_mode: Film,
   clean_mode: Minimize2,
   retro_mode: Clock,
   dynamic_mode: Activity,
 };
 
 const intensityColors: Record<string, string> = {
   subtle: 'text-success',
   moderate: 'text-warning',
   intense: 'text-destructive',
 };
 
 export default function EffectsPanel({ effectPreset, onEffectPresetChange, disabled }: EffectsPanelProps) {
   const selected = EFFECT_PRESETS.find(e => e.id === effectPreset);
 
   return (
    <div className="space-y-5">
       {/* Effect Modes */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-2xl" />
         <div className="panel-header">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Effect Modes</span>
          </div>
           <Zap className="w-3.5 h-3.5 text-accent" />
         </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
           {EFFECT_PRESETS.map((preset) => {
             const Icon = icons[preset.id] || Zap;
             const active = effectPreset === preset.id;
             return (
               <button
                 key={preset.id}
                 onClick={() => !disabled && onEffectPresetChange(preset.id)}
                 disabled={disabled}
                className={cn('preset-card text-left p-4 space-y-3', active && 'active')}
               >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center border transition-colors',
                    active 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-muted/50 border-border/30'
                  )}>
                    <Icon className={cn('w-4.5 h-4.5', active ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                   <span className={cn('text-[9px] uppercase font-medium', intensityColors[preset.intensity])}>
                     {preset.intensity}
                   </span>
                 </div>
                <div>
                  <p className={cn('text-xs font-semibold', active && 'text-primary')}>{preset.name}</p>
                  <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">{preset.description}</p>
                </div>
               </button>
             );
           })}
         </div>
       </div>
 
       {/* Effect Details */}
       {selected && (
        <div className="panel relative overflow-hidden">
           <div className="panel-header">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              <span className="panel-title">Active Effects</span>
            </div>
            <span className={cn('text-[9px] uppercase font-bold', intensityColors[selected.intensity])}>
              {selected.intensity}
            </span>
           </div>
          <div className="p-4 space-y-4">
             <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2 tracking-wider font-medium">Transitions</p>
              <div className="flex flex-wrap gap-1.5">
                 {selected.transitions.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                     {t.replace(/_/g, ' ')}
                   </span>
                 ))}
               </div>
             </div>
             <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2 tracking-wider font-medium">Motion Effects</p>
              <div className="flex flex-wrap gap-1.5">
                 {selected.motionEffects.map((e) => (
                  <span key={e} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                     {e.replace(/_/g, ' ')}
                   </span>
                 ))}
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }