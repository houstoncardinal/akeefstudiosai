 import { GRAPHICS_TEMPLATES } from '@/lib/presets';
 import { cn } from '@/lib/utils';
 import { Type, Subtitles, LayoutTemplate, Play, Square, Check, Sparkles } from 'lucide-react';
 
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
   title: 'bg-primary/5',
   lower_third: 'bg-accent/5',
   caption: 'bg-success/5',
   opener: 'bg-magenta/5',
   end_card: 'bg-warning/5',
 };
 
 const typeAccentColors: Record<string, string> = {
   title: 'text-primary',
   lower_third: 'text-accent',
   caption: 'text-success',
   opener: 'text-magenta',
   end_card: 'text-warning',
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
    <div className="space-y-5">
       {Object.entries(grouped).map(([type, templates]) => {
         const Icon = typeIcons[type] || Type;
        const accentColor = typeAccentColors[type] || 'text-primary';
         return (
          <div key={type} className="panel relative overflow-hidden">
             <div className="panel-header">
               <div className="flex items-center gap-2">
                <Icon className={cn('w-3.5 h-3.5', accentColor)} />
                 <span className="panel-title">{type.replace(/_/g, ' ')}s</span>
               </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] font-bold', accentColor)}>
                  {templates.filter(t => selectedGraphics.includes(t.id)).length}
                </span>
                <span className="text-[10px] text-muted-foreground">/ {templates.length}</span>
              </div>
             </div>
            <div className="p-4 grid grid-cols-2 gap-3">
               {templates.map((template) => {
                 const active = selectedGraphics.includes(template.id);
                 return (
                   <button
                     key={template.id}
                     onClick={() => toggle(template.id)}
                     disabled={disabled}
                     className={cn(
                      'relative text-left p-4 rounded-lg border transition-all duration-200',
                      active 
                        ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/10' 
                        : `border-border/40 ${typeColors[type]} hover:border-primary/40 hover:bg-primary/5`
                     )}
                   >
                     {active && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Check className="w-3 h-3 text-primary-foreground" />
                       </div>
                     )}
                    <p className={cn('text-xs font-semibold pr-6', active && 'text-primary')}>{template.name}</p>
                    <p className="text-[9px] text-muted-foreground line-clamp-2 mt-1">{template.description}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 border border-border/30">
                      <Sparkles className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[8px] text-muted-foreground font-mono">{template.animation.replace(/_/g, ' ')}</span>
                    </div>
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