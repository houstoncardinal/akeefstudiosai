 import { useMemo } from 'react';
 import { cn } from '@/lib/utils';
 
 interface TimelinePanelProps {
   fileContent: string | null;
   isProcessing: boolean;
 }
 
 export default function TimelinePanel({ fileContent, isProcessing }: TimelinePanelProps) {
   const clips = useMemo(() => {
     if (!fileContent) return [];
     const matches = fileContent.match(/<(clip|asset-clip)[^>]*>/g) || [];
     let pos = 0;
     return matches.slice(0, 10).map((_, i) => {
       const dur = 8 + Math.random() * 12;
       const clip = { start: pos, duration: Math.min(dur, 100 - pos) };
       pos += dur + 0.5;
       return clip;
     });
   }, [fileContent]);
 
   const waveform = useMemo(() => Array.from({ length: 50 }, () => 20 + Math.random() * 60), []);
 
   if (!fileContent) {
     return (
       <div className="panel h-full">
         <div className="panel-header">
           <span className="panel-title">Timeline Preview</span>
         </div>
         <div className="p-6 flex items-center justify-center h-[120px] text-muted-foreground text-sm">
           Import a file to see timeline
         </div>
       </div>
     );
   }
 
   return (
     <div className="panel h-full">
       <div className="panel-header">
         <span className="panel-title">Timeline Preview</span>
         <div className="flex items-center gap-1.5">
           <div className={cn('w-1.5 h-1.5 rounded-full', isProcessing ? 'bg-primary animate-pulse' : 'bg-success')} />
           <span className="text-[10px] text-muted-foreground">{clips.length} clips</span>
         </div>
       </div>
       <div className="p-3 space-y-2">
         {/* Ruler */}
         <div className="flex text-[8px] text-muted-foreground uppercase">
           {['00:00', '00:30', '01:00', '01:30', '02:00'].map((t, i) => (
             <span key={i} className="flex-1 text-center">{t}</span>
           ))}
         </div>
         {/* V1 */}
         <div className="flex items-center gap-2">
           <span className="w-8 text-[9px] text-muted-foreground">V1</span>
           <div className="flex-1 h-6 rounded-sm bg-muted/30 relative overflow-hidden">
             {clips.map((c, i) => (
               <div
                 key={i}
                 className={cn(
                   'absolute h-full rounded-sm border-l-2',
                   isProcessing && 'animate-pulse',
                   i % 3 === 0 ? 'bg-primary/40 border-primary' : i % 3 === 1 ? 'bg-accent/40 border-accent' : 'bg-magenta/40 border-magenta'
                 )}
                 style={{ left: `${c.start}%`, width: `${c.duration}%` }}
               />
             ))}
             {isProcessing && (
               <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute h-full w-1/4 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
               </div>
             )}
           </div>
         </div>
         {/* A1 */}
         <div className="flex items-center gap-2">
           <span className="w-8 text-[9px] text-muted-foreground">A1</span>
           <div className="flex-1 h-5 rounded-sm bg-muted/30 flex items-end px-0.5 gap-px overflow-hidden">
             {waveform.map((h, i) => (
               <div
                 key={i}
                 className={cn('w-1 bg-success/50 rounded-t-sm', isProcessing && 'animate-waveform')}
                 style={{ height: `${h}%`, animationDelay: `${i * 0.02}s` }}
               />
             ))}
           </div>
         </div>
       </div>
     </div>
   );
 }