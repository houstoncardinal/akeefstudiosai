 import { GRAPHICS_TEMPLATES } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Type, Subtitles, LayoutTemplate, Play, Square, Check } from 'lucide-react';
 
 interface GraphicsPanelProps {
   selectedGraphics: string[];
   onGraphicsChange: (graphics: string[]) => void;
   disabled?: boolean;
 }
 
 const typeIcons: Record<string, typeof Type> = {
   title: Type,
   lower_third: LayoutTemplate,
   caption: Subtitles,
   opener: Play,
   end_card: Square,
 };
 
 const typeColors: Record<string, string> = {
   title: 'border-primary/30 bg-primary/5',
   lower_third: 'border-accent/30 bg-accent/5',
   caption: 'border-success/30 bg-success/5',
   opener: 'border-magenta/30 bg-magenta/5',
   end_card: 'border-warning/30 bg-warning/5',
 };
 
 export default function GraphicsPanel({ selectedGraphics, onGraphicsChange, disabled }: GraphicsPanelProps) {
   const toggle = (id: string) => {
     if (disabled) return;
     if (selectedGraphics.includes(id)) {
       onGraphicsChange(selectedGraphics.filter(g => g !== id));
     } else {
       onGraphicsChange([...selectedGraphics, id]);
     }
   };
 
   const grouped = GRAPHICS_TEMPLATES.reduce((acc, t) => {
     if (!acc[t.type]) acc[t.type] = [];
     acc[t.type].push(t);
     return acc;
   }, {} as Record<string, typeof GRAPHICS_TEMPLATES>);
 
   return (
     <div className="space-y-4">
       {Object.entries(grouped).map(([type, templates]) => {
         const Icon = typeIcons[type] || Type;
         return (
           <div key={type} className="panel">
             <div className="panel-header">
               <div className="flex items-center gap-2">
                 <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                 <span className="panel-title">{type.replace(/_/g, ' ')}s</span>
               </div>
               <span className="text-[10px] text-muted-foreground">
                 {templates.filter(t => selectedGraphics.includes(t.id)).length}/{templates.length}
               </span>
             </div>
             <div className="p-3 grid grid-cols-2 gap-2">
               {templates.map((template) => {
                 const active = selectedGraphics.includes(template.id);
                 return (
                   <button
                     key={template.id}
                     onClick={() => toggle(template.id)}
                     disabled={disabled}
                     className={cn(
                       'relative text-left p-3 rounded border transition-all',
                       active ? 'border-primary bg-primary/10' : `${typeColors[type]} hover:border-primary/50`
                     )}
                   >
                     {active && (
                       <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                         <Check className="w-2.5 h-2.5 text-primary-foreground" />
                       </div>
                     )}
                     <p className={cn('text-xs font-medium', active && 'text-primary')}>{template.name}</p>
                     <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">{template.description}</p>
                     <p className="text-[8px] text-muted-foreground mt-1 font-mono">{template.animation}</p>
                   </button>
                 );
               })}
             </div>
           </div>
         );
       })}
     </div>
   );
 }