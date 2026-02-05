 import { STYLE_PRESETS, AI_MODELS } from '@/lib/presets';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { cn } from '@/lib/utils';
 import { Film, Music, Smartphone, Briefcase, Video, Cpu } from 'lucide-react';
 
 interface StylePanelProps {
   style: string;
   onStyleChange: (style: string) => void;
   customRules: string;
   onCustomRulesChange: (rules: string) => void;
   model: string;
   onModelChange: (model: string) => void;
   disabled?: boolean;
 }
 
 const icons: Record<string, typeof Film> = {
   cinematic: Film,
   music_video_hype: Music,
   social_tiktok: Smartphone,
   commercial_clean: Briefcase,
   concert_multicam: Video,
 };
 
 export default function StylePanel({ style, onStyleChange, customRules, onCustomRulesChange, model, onModelChange, disabled }: StylePanelProps) {
   return (
     <div className="space-y-4">
       {/* Style presets */}
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">Style Presets</span>
         </div>
         <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
           {STYLE_PRESETS.map((preset) => {
             const Icon = icons[preset.id] || Film;
             const active = style === preset.id;
             return (
               <button
                 key={preset.id}
                 onClick={() => !disabled && onStyleChange(preset.id)}
                 disabled={disabled}
                 className={cn(
                   'preset-card text-left p-3 flex flex-col gap-2',
                   active && 'active'
                 )}
               >
                 <Icon className={cn('w-5 h-5', active ? 'text-primary' : 'text-muted-foreground')} />
                 <div>
                   <p className={cn('text-sm font-medium', active && 'text-primary')}>{preset.name}</p>
                   <p className="text-[10px] text-muted-foreground line-clamp-2">{preset.description}</p>
                 </div>
               </button>
             );
           })}
         </div>
       </div>
 
       {/* AI Model */}
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">AI Engine</span>
           <Cpu className="w-3.5 h-3.5 text-primary" />
         </div>
         <div className="p-3">
           <Select value={model} onValueChange={onModelChange} disabled={disabled}>
             <SelectTrigger className="bg-muted/50 border-border/50">
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
               {AI_MODELS.map((m) => (
                 <SelectItem key={m.id} value={m.id}>
                   <div className="flex items-center gap-2">
                     <div className={cn('w-2 h-2 rounded-full', m.id.includes('flash') ? 'bg-success' : m.id.includes('pro') ? 'bg-primary' : 'bg-accent')} />
                     <span>{m.name}</span>
                   </div>
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
           <p className="text-[10px] text-muted-foreground mt-1.5">
             {AI_MODELS.find(m => m.id === model)?.description}
           </p>
         </div>
       </div>
 
       {/* Custom rules */}
       <div className="panel">
         <div className="panel-header">
           <span className="panel-title">Custom Edit Rules</span>
         </div>
         <div className="p-3">
           <Textarea
             value={customRules}
             onChange={(e) => onCustomRulesChange(e.target.value)}
             rows={10}
             className="font-mono text-xs leading-relaxed bg-muted/30 border-border/50 resize-none"
             disabled={disabled}
           />
         </div>
       </div>
     </div>
   );
 }