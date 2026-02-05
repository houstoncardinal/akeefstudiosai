 import { STYLE_PRESETS, AI_MODELS } from '@/lib/presets';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { cn } from '@/lib/utils';
 import { Film, Music, Smartphone, Briefcase, Video, Cpu, Sparkles, Zap, Crown } from 'lucide-react';
 
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
 
 const tierIcons: Record<string, typeof Zap> = {
   fast: Zap,
   balanced: Sparkles,
   premium: Crown,
 };
 
 const tierColors: Record<string, string> = {
   fast: 'text-success',
   balanced: 'text-primary',
   premium: 'text-accent',
 };
 
 export default function StylePanel({ style, onStyleChange, customRules, onCustomRulesChange, model, onModelChange, disabled }: StylePanelProps) {
   const selectedModel = AI_MODELS.find(m => m.id === model);
 
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
            <span className="panel-title">AI Processing Engine</span>
           <Cpu className="w-3.5 h-3.5 text-primary" />
         </div>
         <div className="p-3">
            {/* Provider badges */}
            <div className="flex gap-2 mb-3">
               <div className={cn(
                 'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all',
                 model.startsWith('google/') 
                   ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50' 
                   : 'bg-muted/50 text-muted-foreground/50'
               )}>
                 Gemini
               </div>
               <div className={cn(
                 'px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all',
                 model.startsWith('openai/') 
                   ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' 
                   : 'bg-muted/50 text-muted-foreground/50'
               )}>
                 OpenAI
               </div>
            </div>
            
           <Select value={model} onValueChange={onModelChange} disabled={disabled}>
             <SelectTrigger className="bg-muted/50 border-border/50">
               <SelectValue />
             </SelectTrigger>
             <SelectContent>
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Google Gemini
                </div>
                {AI_MODELS.filter(m => m.provider === 'gemini').map((m) => {
                  const TierIcon = tierIcons[m.tier] || Sparkles;
                  return (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <TierIcon className={cn('w-3.5 h-3.5', tierColors[m.tier])} />
                        <span>{m.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-2 border-t border-border/30 pt-2">
                  OpenAI GPT
                </div>
                {AI_MODELS.filter(m => m.provider === 'openai').map((m) => {
                  const TierIcon = tierIcons[m.tier] || Sparkles;
                  return (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <TierIcon className={cn('w-3.5 h-3.5', tierColors[m.tier])} />
                        <span>{m.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
             </SelectContent>
           </Select>
            
            {/* Model details */}
            {selectedModel && (
              <div className="mt-3 p-2 rounded bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const TierIcon = tierIcons[selectedModel.tier] || Sparkles;
                      return <TierIcon className={cn('w-3.5 h-3.5', tierColors[selectedModel.tier])} />;
                    })()}
                    <span className="text-xs font-medium">{selectedModel.name}</span>
                  </div>
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded uppercase font-bold',
                    selectedModel.provider === 'gemini' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {selectedModel.provider}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {selectedModel.description}
                </p>
              </div>
            )}
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