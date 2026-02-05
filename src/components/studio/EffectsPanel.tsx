 import { EFFECT_PRESETS } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Zap, Film, Minimize2, Clock, Activity, Badge } from 'lucide-react';
 
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
     <div className="space-y-4">
       {/* Effect Modes */}
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">Effect Modes</span>
           <Zap className="w-3.5 h-3.5 text-accent" />
         </div>
         <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
           {EFFECT_PRESETS.map((preset) => {
             const Icon = icons[preset.id] || Zap;
             const active = effectPreset === preset.id;
             return (
               <button
                 key={preset.id}
                 onClick={() => !disabled && onEffectPresetChange(preset.id)}
                 disabled={disabled}
                 className={cn('preset-card text-left p-3', active && 'active')}
               >
                 <div className="flex items-center justify-between mb-2">
                   <Icon className={cn('w-5 h-5', active ? 'text-primary' : 'text-muted-foreground')} />
                   <span className={cn('text-[9px] uppercase font-medium', intensityColors[preset.intensity])}>
                     {preset.intensity}
                   </span>
                 </div>
                 <p className={cn('text-xs font-medium', active && 'text-primary')}>{preset.name}</p>
                 <p className="text-[9px] text-muted-foreground line-clamp-1">{preset.description}</p>
               </button>
             );
           })}
         </div>
       </div>
 
       {/* Effect Details */}
       {selected && (
         <div className="panel">
           <div className="panel-header">
             <span className="panel-title">Active Effects</span>
           </div>
           <div className="p-3 space-y-3">
             <div>
               <p className="text-[10px] uppercase text-muted-foreground mb-1.5">Transitions</p>
               <div className="flex flex-wrap gap-1">
                 {selected.transitions.map((t) => (
                   <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">
                     {t.replace(/_/g, ' ')}
                   </span>
                 ))}
               </div>
             </div>
             <div>
               <p className="text-[10px] uppercase text-muted-foreground mb-1.5">Motion Effects</p>
               <div className="flex flex-wrap gap-1">
                 {selected.motionEffects.map((e) => (
                   <span key={e} className="px-2 py-0.5 rounded text-[10px] bg-accent/10 text-accent border border-accent/20">
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