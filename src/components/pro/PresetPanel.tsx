 import { EDIT_PRESETS } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Sparkles, Music, Zap, Film, Camera, Layers } from 'lucide-react';
 
 interface PresetPanelProps {
   preset: string;
   onPresetChange: (preset: string) => void;
   disabled?: boolean;
 }
 
 const presetIcons: Record<string, typeof Sparkles> = {
   music_video_rough_cut: Music,
   hyper_vibe_quick_cuts: Zap,
   clean_story_cut: Film,
   concert_multicam_fast_switch: Camera,
   broll_montage_inserts: Layers,
 };
 
 const presetColors: Record<string, string> = {
   music_video_rough_cut: 'from-primary to-magenta',
   hyper_vibe_quick_cuts: 'from-accent to-destructive',
   clean_story_cut: 'from-primary to-success',
   concert_multicam_fast_switch: 'from-magenta to-accent',
   broll_montage_inserts: 'from-success to-primary',
 };
 
 export default function PresetPanel({ preset, onPresetChange, disabled }: PresetPanelProps) {
   return (
     <div className="panel">
       <div className="panel-header">
         <span className="panel-title">Edit Presets</span>
         <Sparkles className="w-3.5 h-3.5 text-primary" />
       </div>
       
       <div className="p-3 space-y-2">
         {EDIT_PRESETS.map((p) => {
           const Icon = presetIcons[p.id] || Sparkles;
           const isActive = preset === p.id;
           const gradientClass = presetColors[p.id] || 'from-primary to-accent';
           
           return (
             <button
               key={p.id}
               onClick={() => !disabled && onPresetChange(p.id)}
               disabled={disabled}
               className={cn(
                 'preset-card w-full text-left flex items-start gap-3 group',
                 isActive && 'active',
                 disabled && 'opacity-50 cursor-not-allowed'
               )}
             >
               <div className={cn(
                 'w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-all',
                 isActive 
                   ? `bg-gradient-to-br ${gradientClass}` 
                   : 'bg-muted/50 group-hover:bg-muted'
               )}>
                 <Icon className={cn(
                   'w-4 h-4',
                   isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                 )} />
               </div>
               <div className="flex-1 min-w-0">
                 <p className={cn(
                   'text-sm font-medium truncate',
                   isActive ? 'text-primary' : 'text-foreground'
                 )}>
                   {p.name}
                 </p>
                 <p className="text-xs text-muted-foreground line-clamp-1">
                   {p.description}
                 </p>
               </div>
               {isActive && (
                 <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0 animate-pulse" />
               )}
             </button>
           );
         })}
       </div>
     </div>
   );
 }