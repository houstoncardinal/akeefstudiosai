 import { useMemo } from 'react';
 import { cn } from '@/lib/utils';
 
 interface TimelineVisualizerProps {
   xmlContent: string;
   isProcessing: boolean;
 }
 
 export default function TimelineVisualizer({ xmlContent, isProcessing }: TimelineVisualizerProps) {
   const clips = useMemo(() => parseClips(xmlContent), [xmlContent]);
   
   // Generate waveform bars
   const waveformBars = useMemo(() => {
     return Array.from({ length: 60 }, (_, i) => ({
       height: 20 + Math.random() * 60,
       delay: i * 0.02,
     }));
   }, []);
 
   return (
     <div className="panel">
       <div className="panel-header">
         <span className="panel-title">Timeline Preview</span>
         <div className="flex items-center gap-2">
           <div className={cn(
             'w-2 h-2 rounded-full',
             isProcessing ? 'bg-primary animate-pulse' : 'bg-success'
           )} />
           <span className="text-xs text-muted-foreground">
             {clips.length} clips detected
           </span>
         </div>
       </div>
       
       <div className="p-4 space-y-4">
         {/* Timeline ruler */}
         <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-wider">
           {['00:00', '00:30', '01:00', '01:30', '02:00'].map((t, i) => (
             <span key={i} className="flex-1 text-center">{t}</span>
           ))}
         </div>
         
         {/* Video track */}
         <div className="space-y-1">
           <div className="flex items-center gap-2 mb-1">
             <div className="w-12 text-[10px] text-muted-foreground uppercase">V1</div>
             <div className="flex-1 h-8 rounded-sm bg-muted/30 relative overflow-hidden">
               {clips.slice(0, 8).map((clip, i) => (
                 <div
                   key={i}
                   className={cn(
                     'absolute h-full rounded-sm border-l-2 transition-all duration-300',
                     isProcessing && 'animate-pulse',
                     i % 3 === 0 ? 'bg-primary/40 border-primary' :
                     i % 3 === 1 ? 'bg-accent/40 border-accent' :
                     'bg-magenta/40 border-magenta'
                   )}
                   style={{
                     left: `${clip.start}%`,
                     width: `${clip.duration}%`,
                   }}
                 />
               ))}
               {isProcessing && (
                 <div className="absolute inset-0 overflow-hidden">
                   <div className="absolute h-full w-1/4 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan" />
                 </div>
               )}
             </div>
           </div>
 
           {/* Audio track */}
           <div className="flex items-center gap-2">
             <div className="w-12 text-[10px] text-muted-foreground uppercase">A1</div>
             <div className="flex-1 h-6 rounded-sm bg-muted/30 flex items-end px-0.5 gap-px overflow-hidden">
               {waveformBars.map((bar, i) => (
                 <div
                   key={i}
                   className={cn(
                     'w-1 bg-success/50 rounded-t-sm transition-all',
                     isProcessing && 'animate-waveform'
                   )}
                   style={{
                     height: `${bar.height}%`,
                     animationDelay: `${bar.delay}s`,
                   }}
                 />
               ))}
             </div>
           </div>
 
           {/* Audio track 2 */}
           <div className="flex items-center gap-2">
             <div className="w-12 text-[10px] text-muted-foreground uppercase">A2</div>
             <div className="flex-1 h-5 rounded-sm bg-muted/30 flex items-end px-0.5 gap-px overflow-hidden">
               {waveformBars.slice(0, 40).map((bar, i) => (
                 <div
                   key={i}
                   className={cn(
                     'w-1 bg-accent/40 rounded-t-sm',
                     isProcessing && 'animate-waveform'
                   )}
                   style={{
                     height: `${bar.height * 0.6}%`,
                     animationDelay: `${bar.delay + 0.1}s`,
                   }}
                 />
               ))}
             </div>
           </div>
         </div>
 
         {/* Playhead */}
         <div className="relative h-1 bg-muted/50 rounded-full">
           <div 
             className={cn(
               'absolute top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300',
               isProcessing ? 'animate-pulse' : ''
             )}
             style={{ width: isProcessing ? '60%' : '0%' }}
           />
           <div 
             className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background glow-cyan-sm transition-all duration-300"
             style={{ left: isProcessing ? '60%' : '0%' }}
           />
         </div>
       </div>
     </div>
   );
 }
 
 function parseClips(xml: string) {
   const clips: { start: number; duration: number }[] = [];
   const clipMatches = xml.match(/<(clip|asset-clip)[^>]*>/g) || [];
   
   let position = 0;
   clipMatches.slice(0, 12).forEach((_, i) => {
     const duration = 8 + Math.random() * 12;
     clips.push({
       start: position,
       duration: Math.min(duration, 100 - position),
     });
     position += duration + 0.5;
   });
   
   return clips;
 }