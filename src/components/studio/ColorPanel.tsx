 import { COLOR_GRADES } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Palette, Sun, Moon, Droplets, Sparkles, Zap, CheckCircle } from 'lucide-react';
 import { Slider } from '@/components/ui/slider';
 
 interface ColorPanelProps {
   colorGrade: string;
   onColorGradeChange: (colorGrade: string) => void;
   disabled?: boolean;
 }
 
 const icons: Record<string, typeof Palette> = {
   cinematic_teal_orange: Palette,
   vintage_film: Moon,
   moody_desaturated: Droplets,
   vibrant_pop: Sparkles,
   clean_natural: Sun,
   neon_nights: Zap,
 };
 
 const previewColors: Record<string, string[]> = {
   cinematic_teal_orange: ['#0d7377', '#14919b', '#e96c3c', '#d4a574'],
   vintage_film: ['#d4a574', '#c4956a', '#8b7355', '#6b5344'],
   moody_desaturated: ['#4a4a4a', '#5a5a5a', '#3a3a4a', '#2a2a3a'],
   vibrant_pop: ['#ff4444', '#44aaff', '#44ff88', '#ffaa44'],
   clean_natural: ['#f5f5f5', '#e0e0e0', '#888888', '#333333'],
   neon_nights: ['#00ffff', '#ff00ff', '#00ff00', '#ff0088'],
 };
 
 export default function ColorPanel({ colorGrade, onColorGradeChange, disabled }: ColorPanelProps) {
   const selectedGrade = COLOR_GRADES.find(g => g.id === colorGrade);
 
   return (
     <div className="space-y-4">
      {/* LUT Presets Grid */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
         <div className="panel-header">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-primary" />
            <span className="panel-title">Color LUTs</span>
          </div>
           <Palette className="w-3.5 h-3.5 text-primary" />
         </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
           {COLOR_GRADES.map((grade) => {
             const Icon = icons[grade.id] || Palette;
             const active = colorGrade === grade.id;
             const colors = previewColors[grade.id] || ['#888', '#666', '#444', '#222'];
             return (
               <button
                 key={grade.id}
                 onClick={() => !disabled && onColorGradeChange(grade.id)}
                 disabled={disabled}
                className={cn('preset-card text-left p-3 space-y-2', active && 'active')}
               >
                {/* Color preview gradient */}
                <div className="flex h-4 rounded overflow-hidden shadow-inner">
                   {colors.map((c, i) => (
                    <div key={i} className="flex-1 transition-transform hover:scale-y-110" style={{ backgroundColor: c }} />
                   ))}
                 </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn('text-xs font-semibold', active && 'text-primary')}>{grade.name}</p>
                    <p className="text-[9px] text-muted-foreground line-clamp-1">{grade.description}</p>
                  </div>
                  {active && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
               </button>
             );
           })}
         </div>
       </div>
 
       {/* Grade Settings */}
       {selectedGrade && (
        <div className="panel relative overflow-hidden">
           <div className="panel-header">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="panel-title">Grade Parameters</span>
            </div>
            <span className="text-[9px] text-muted-foreground font-mono">{selectedGrade.lut}</span>
           </div>
          <div className="p-4 space-y-4">
             {[
               { label: 'Contrast', value: selectedGrade.settings.contrast, range: [0.5, 2] },
               { label: 'Saturation', value: selectedGrade.settings.saturation, range: [0, 2] },
               { label: 'Temperature', value: selectedGrade.settings.temperature, range: [-50, 50] },
               { label: 'Shadows', value: selectedGrade.settings.shadows, range: [-50, 50] },
               { label: 'Highlights', value: selectedGrade.settings.highlights, range: [-50, 50] },
             ].map((setting) => (
              <div key={setting.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{setting.label}</span>
                  <span className="text-[11px] font-mono font-semibold text-foreground bg-muted/50 px-2 py-0.5 rounded">
                    {setting.value > 0 ? `+${setting.value}` : setting.value}
                  </span>
                 </div>
                 <Slider
                   value={[setting.value]}
                   min={setting.range[0]}
                   max={setting.range[1]}
                   step={0.1}
                   disabled
                  className="opacity-70"
                 />
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   );
 }