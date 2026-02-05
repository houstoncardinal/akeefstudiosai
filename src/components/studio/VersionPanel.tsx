 import { VERSION_TYPES } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Check, Layers, Monitor, Smartphone, Film, Sparkles } from 'lucide-react';
 
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
     <div className="panel">
       <div className="panel-header">
         <span className="panel-title">Output Versions</span>
         <Layers className="w-3.5 h-3.5 text-primary" />
       </div>
       <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
         {VERSION_TYPES.map((version) => {
           const active = selectedVersions.includes(version.id);
           return (
             <button
               key={version.id}
               onClick={() => toggle(version.id)}
               disabled={disabled}
               className={cn(
                 'relative text-left p-3 rounded border transition-all',
                 active ? 'border-primary bg-primary/10' : 'border-border/50 bg-muted/30 hover:border-primary/50'
               )}
             >
               {active && (
                 <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                   <Check className="w-2.5 h-2.5 text-primary-foreground" />
                 </div>
               )}
               <p className={cn('text-xs font-medium', active && 'text-primary')}>{version.name}</p>
               <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{version.description}</p>
               <div className="flex items-center gap-2 mt-2 text-[8px] text-muted-foreground">
                 <span>{version.duration}</span>
                 <span>•</span>
                 <span>{version.aspectRatio}</span>
               </div>
             </button>
           );
         })}
       </div>
     </div>
   );
 }