 import { VERSION_TYPES } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Check, Layers, Monitor, Smartphone, Film, Sparkles, Clock, Ratio } from 'lucide-react';
 
 interface VersionPanelProps {
   selectedVersions: string[];
   onVersionsChange: (versions: string[]) => void;
   disabled?: boolean;
 }
 
 export default function VersionPanel({ selectedVersions, onVersionsChange, disabled }: VersionPanelProps) {
   const toggle = (id: string) => {
     if (disabled) return;
     if (selectedVersions.includes(id)) {
       onVersionsChange(selectedVersions.filter(v => v !== id));
     } else {
       onVersionsChange([...selectedVersions, id]);
     }
   };
 
   return (
    <div className="panel relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
       <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Output Versions</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary">{selectedVersions.length}</span>
          <span className="text-[10px] text-muted-foreground">selected</span>
        </div>
       </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
         {VERSION_TYPES.map((version) => {
           const active = selectedVersions.includes(version.id);
          const isVertical = version.aspectRatio === '9:16';
           return (
             <button
               key={version.id}
               onClick={() => toggle(version.id)}
               disabled={disabled}
               className={cn(
                'relative text-left p-4 rounded-lg border transition-all duration-200',
                active 
                  ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10' 
                  : 'border-border/40 bg-muted/30 hover:border-primary/40 hover:bg-primary/5'
               )}
             >
               {active && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Check className="w-3 h-3 text-primary-foreground" />
                 </div>
               )}
              
              {/* Aspect ratio preview */}
              <div className={cn(
                'mb-3 border border-border/40 rounded flex items-center justify-center bg-muted/30',
                isVertical ? 'w-6 h-10' : 'w-10 h-6'
              )}>
                <Film className="w-3 h-3 text-muted-foreground/50" />
              </div>
              
              <p className={cn('text-xs font-semibold pr-6', active && 'text-primary')}>{version.name}</p>
              <p className="text-[9px] text-muted-foreground line-clamp-2 mt-1">{version.description}</p>
              
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{version.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
                  <Ratio className="w-2.5 h-2.5" />
                  <span>{version.aspectRatio}</span>
                </div>
               </div>
             </button>
           );
         })}
       </div>
     </div>
   );
 }