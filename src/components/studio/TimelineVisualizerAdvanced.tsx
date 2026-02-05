 import { useMemo, useState } from 'react';
 import { cn } from '@/lib/utils';
 import { 
   Clock, 
   Volume2, 
   Film, 
   Music, 
   BarChart3, 
   Activity, 
   Zap,
   Eye,
   Grid,
   Layers,
   Play,
   Pause,
   SkipBack,
   SkipForward,
   Maximize2,
   Settings2
 } from 'lucide-react';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Switch } from '@/components/ui/switch';
 import { Slider } from '@/components/ui/slider';
 import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { type VideoFormat } from '@/lib/formats';
 
 interface TimelineVisualizerAdvancedProps {
   fileContent: string | null;
   isProcessing: boolean;
   detectedFormat?: VideoFormat | null;
   detectedBPM?: number | null;
 }
 
 interface Marker {
   position: number;
   type: 'beat' | 'section' | 'cut' | 'transition';
   label?: string;
 }
 
 export default function TimelineVisualizerAdvanced({ 
   fileContent, 
   isProcessing, 
   detectedFormat,
   detectedBPM 
 }: TimelineVisualizerAdvancedProps) {
   const [showBeatGrid, setShowBeatGrid] = useState(true);
   const [showEnergyGraph, setShowEnergyGraph] = useState(true);
   const [showCutFrequency, setShowCutFrequency] = useState(false);
   const [showSectionMarkers, setShowSectionMarkers] = useState(true);
   const [isPlaying, setIsPlaying] = useState(false);
   const [playheadPosition, setPlayheadPosition] = useState(0);
   const [zoom, setZoom] = useState(100);
   const [activeView, setActiveView] = useState<'timeline' | 'energy' | 'rhythm'>('timeline');
   
   const isVideoFile = detectedFormat && detectedFormat.category !== 'timeline';
 
   // Parse clips from content
   const clips = useMemo(() => {
     if (isVideoFile) {
       return Array.from({ length: 8 }, (_, i) => ({
         start: i * 12,
         duration: 10,
         type: i % 3 === 0 ? 'a-roll' : 'b-roll',
       }));
     }
     
     if (!fileContent) return [];
     const matches = fileContent.match(/<(clip|asset-clip)[^>]*>/g) || [];
     let pos = 0;
     return matches.slice(0, 12).map((_, i) => {
       const dur = 6 + Math.random() * 10;
       const clip = { 
         start: pos, 
         duration: Math.min(dur, 100 - pos),
         type: i % 3 === 0 ? 'a-roll' : 'b-roll',
       };
       pos += dur + 0.3;
       return clip;
     });
   }, [fileContent, isVideoFile]);
 
   // Generate beat grid based on BPM
   const beatMarkers = useMemo(() => {
     if (!detectedBPM) return [];
     const beatsPerSecond = detectedBPM / 60;
     const totalSeconds = 120; // 2 minutes
     const markers: Marker[] = [];
     
     for (let i = 0; i < totalSeconds * beatsPerSecond; i++) {
       const position = (i / (totalSeconds * beatsPerSecond)) * 100;
       const isDownbeat = i % 4 === 0;
       markers.push({
         position,
         type: 'beat',
         label: isDownbeat ? `${Math.floor(i / 4) + 1}` : undefined,
       });
     }
     return markers;
   }, [detectedBPM]);
 
   // Generate section markers
   const sectionMarkers: Marker[] = useMemo(() => [
     { position: 0, type: 'section', label: 'Intro' },
     { position: 15, type: 'section', label: 'Verse 1' },
     { position: 35, type: 'section', label: 'Chorus' },
     { position: 55, type: 'section', label: 'Verse 2' },
     { position: 70, type: 'section', label: 'Bridge' },
     { position: 85, type: 'section', label: 'Outro' },
   ], []);
 
   // Generate energy curve data
   const energyData = useMemo(() => 
     Array.from({ length: 60 }, (_, i) => {
       const x = i / 60;
       // Create a realistic energy curve with builds and drops
       const base = 0.3;
       const verse = Math.sin(x * Math.PI * 4) * 0.15;
       const chorus = x > 0.3 && x < 0.5 ? 0.4 : 0;
       const drop = x > 0.7 && x < 0.85 ? 0.5 : 0;
       const noise = Math.random() * 0.1;
       return Math.min(1, Math.max(0.1, base + verse + chorus + drop + noise));
     }),
   []);
 
   // Generate cut frequency data
   const cutFrequencyData = useMemo(() => 
     Array.from({ length: 40 }, (_, i) => {
       const position = i / 40;
       // More cuts during chorus sections
       if (position > 0.3 && position < 0.5) return 0.6 + Math.random() * 0.3;
       if (position > 0.7 && position < 0.85) return 0.7 + Math.random() * 0.2;
       return 0.2 + Math.random() * 0.3;
     }),
   []);
 
   // Generate waveform
   const waveform = useMemo(() => 
     Array.from({ length: 80 }, () => 20 + Math.random() * 60),
   []);
 
   if (!fileContent && !isVideoFile) {
     return (
       <div className="panel h-full relative overflow-hidden">
         <div className="panel-header">
           <div className="flex items-center gap-2">
             <Clock className="w-3.5 h-3.5 text-muted-foreground" />
             <span className="panel-title">Timeline Visualizer</span>
           </div>
         </div>
         <div className="p-6 flex flex-col items-center justify-center h-[200px] text-center">
           <div className="w-12 h-12 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-3">
             <Film className="w-5 h-5 text-muted-foreground" />
           </div>
           <p className="text-sm text-muted-foreground font-medium">No media loaded</p>
           <p className="text-[10px] text-muted-foreground/60 mt-1">Import a video or timeline to visualize</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="panel h-full relative overflow-hidden">
       {isProcessing && (
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse z-10 pointer-events-none" />
       )}
       
       {/* Header */}
       <div className="panel-header">
         <div className="flex items-center gap-2">
           <Clock className="w-3.5 h-3.5 text-primary" />
           <span className="panel-title">Timeline Visualizer</span>
         </div>
         <div className="flex items-center gap-2">
           {detectedBPM && (
             <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary gap-1">
               <Activity className="w-2.5 h-2.5" />
               {detectedBPM} BPM
             </Badge>
           )}
           <Badge variant="outline" className="text-[9px]">
             {clips.length} clips
           </Badge>
         </div>
       </div>
 
       {/* View Tabs */}
       <div className="px-4 pt-3">
         <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
           <TabsList className="h-7 bg-muted/30 p-0.5">
             <TabsTrigger value="timeline" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
               <Layers className="w-3 h-3" />
               Timeline
             </TabsTrigger>
             <TabsTrigger value="energy" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
               <BarChart3 className="w-3 h-3" />
               Energy
             </TabsTrigger>
             <TabsTrigger value="rhythm" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
               <Music className="w-3 h-3" />
               Rhythm
             </TabsTrigger>
           </TabsList>
         </Tabs>
       </div>
 
       <div className="p-4 space-y-2">
         {/* Timecode ruler */}
         <div className="flex text-[8px] text-muted-foreground uppercase font-mono relative">
           {['00:00', '00:30', '01:00', '01:30', '02:00'].map((t, i) => (
             <div key={i} className="flex-1 text-center relative">
               <span>{t}</span>
               <div className="absolute bottom-0 left-1/2 w-px h-1.5 bg-border/50 transform -translate-x-1/2" />
             </div>
           ))}
         </div>
 
         {/* Section Markers */}
         {showSectionMarkers && (
           <div className="relative h-5 rounded bg-muted/20 border border-border/30">
             {sectionMarkers.map((marker, i) => (
               <div
                 key={i}
                 className="absolute top-0 h-full flex items-center"
                 style={{ left: `${marker.position}%` }}
               >
                 <div className="h-full w-px bg-accent/50" />
                 <span className="text-[8px] text-accent font-medium ml-1 whitespace-nowrap">
                   {marker.label}
                 </span>
               </div>
             ))}
           </div>
         )}
 
         {/* Beat Grid Overlay */}
         {showBeatGrid && detectedBPM && activeView === 'rhythm' && (
           <div className="relative h-6 rounded bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30 overflow-hidden">
             {beatMarkers.map((marker, i) => {
               const isDownbeat = marker.label !== undefined;
               return (
                 <div
                   key={i}
                   className={cn(
                     'absolute top-0 h-full',
                     isDownbeat ? 'w-0.5 bg-primary/60' : 'w-px bg-primary/20'
                   )}
                   style={{ left: `${marker.position}%` }}
                 >
                   {isDownbeat && (
                     <span className="absolute -top-0.5 left-1 text-[7px] text-primary font-mono">
                       {marker.label}
                     </span>
                   )}
                 </div>
               );
             })}
             <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30" />
           </div>
         )}
 
         {/* Energy Graph */}
         {showEnergyGraph && activeView === 'energy' && (
           <div className="space-y-1">
             <div className="flex items-center gap-2">
               <Zap className="w-3 h-3 text-accent" />
               <span className="text-[9px] text-muted-foreground font-medium">Energy Curve</span>
             </div>
             <div className="h-12 rounded bg-muted/20 border border-border/30 flex items-end p-1 gap-px overflow-hidden">
               {energyData.map((value, i) => (
                 <div
                   key={i}
                   className={cn(
                     'flex-1 rounded-t-sm transition-all duration-150',
                     value > 0.7 ? 'bg-gradient-to-t from-accent to-primary' :
                     value > 0.5 ? 'bg-gradient-to-t from-primary/80 to-primary/40' :
                     'bg-gradient-to-t from-primary/50 to-primary/20'
                   )}
                   style={{ height: `${value * 100}%` }}
                 />
               ))}
             </div>
           </div>
         )}
 
         {/* Cut Frequency Graph */}
         {showCutFrequency && activeView === 'energy' && (
           <div className="space-y-1">
             <div className="flex items-center gap-2">
               <Film className="w-3 h-3 text-magenta" />
               <span className="text-[9px] text-muted-foreground font-medium">Cut Frequency</span>
             </div>
             <div className="h-8 rounded bg-muted/20 border border-border/30 flex items-end p-1 gap-0.5 overflow-hidden">
               {cutFrequencyData.map((value, i) => (
                 <div
                   key={i}
                   className="flex-1 bg-magenta/60 rounded-t-sm"
                   style={{ height: `${value * 100}%` }}
                 />
               ))}
             </div>
           </div>
         )}
          
         {/* Video track V1 */}
         {activeView === 'timeline' && (
           <>
             <div className="flex items-center gap-2">
               <div className="w-10 flex items-center gap-1">
                 <Film className="w-3 h-3 text-primary/60" />
                 <span className="text-[9px] text-muted-foreground font-mono">V1</span>
               </div>
               <div className="flex-1 h-10 rounded bg-muted/40 relative overflow-hidden border border-border/30">
                 {/* Beat grid background */}
                 {showBeatGrid && detectedBPM && (
                   <div className="absolute inset-0 pointer-events-none">
                     {beatMarkers.filter(m => m.label).map((marker, i) => (
                       <div
                         key={i}
                         className="absolute top-0 h-full w-px bg-primary/10"
                         style={{ left: `${marker.position}%` }}
                       />
                     ))}
                   </div>
                 )}
                 
                 {clips.map((c, i) => (
                   <div
                     key={i}
                     className={cn(
                       'absolute h-full rounded border-l-2 transition-all duration-300',
                       isProcessing && 'opacity-70',
                       c.type === 'a-roll' 
                         ? 'bg-gradient-to-r from-primary/50 to-primary/30 border-primary' 
                         : i % 2 === 0 
                           ? 'bg-gradient-to-r from-accent/50 to-accent/30 border-accent' 
                           : 'bg-gradient-to-r from-magenta/50 to-magenta/30 border-magenta'
                     )}
                     style={{ left: `${c.start}%`, width: `${c.duration}%` }}
                   >
                     <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
                     <span className="absolute top-1 left-1 text-[7px] text-white/70 font-medium">
                       {c.type === 'a-roll' ? 'A' : 'B'}
                     </span>
                   </div>
                 ))}
                 {isProcessing && (
                   <div className="absolute inset-0 overflow-hidden">
                     <div className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan" />
                   </div>
                 )}
               </div>
             </div>
              
             {/* Audio track A1 */}
             <div className="flex items-center gap-2">
               <div className="w-10 flex items-center gap-1">
                 <Volume2 className="w-3 h-3 text-success/60" />
                 <span className="text-[9px] text-muted-foreground font-mono">A1</span>
               </div>
               <div className="flex-1 h-7 rounded bg-muted/40 flex items-end px-1 gap-[2px] overflow-hidden border border-border/30">
                 {waveform.map((h, i) => (
                   <div
                     key={i}
                     className={cn(
                       'flex-1 min-w-[2px] max-w-[4px] bg-gradient-to-t from-success/60 to-success/30 rounded-t-sm transition-all',
                       isProcessing && 'animate-waveform'
                     )}
                     style={{ height: `${h}%`, animationDelay: `${i * 0.02}s` }}
                   />
                 ))}
               </div>
             </div>
           </>
         )}
 
         {/* Playhead & Transport */}
         <div className="pt-2 space-y-2">
           <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
             <div 
               className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-200"
               style={{ width: `${playheadPosition}%` }}
             />
             <Slider
               value={[playheadPosition]}
               onValueChange={([val]) => setPlayheadPosition(val)}
               max={100}
               step={0.1}
               className="absolute inset-0 opacity-0 cursor-pointer"
             />
             <div 
               className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-background shadow-lg transition-all duration-200"
               style={{ left: `calc(${playheadPosition}% - 6px)` }}
             />
           </div>
 
           {/* Transport Controls */}
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-1">
               <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                 <SkipBack className="w-3.5 h-3.5" />
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-7 w-7 p-0"
                 onClick={() => setIsPlaying(!isPlaying)}
               >
                 {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
               </Button>
               <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                 <SkipForward className="w-3.5 h-3.5" />
               </Button>
               <span className="text-[10px] font-mono text-muted-foreground ml-2">
                 {Math.floor(playheadPosition * 1.2)}:{String(Math.floor((playheadPosition * 1.2 % 1) * 60)).padStart(2, '0')}
               </span>
             </div>
 
             <div className="flex items-center gap-3">
               {/* Display Toggles */}
               <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1">
                   <Switch
                     checked={showBeatGrid}
                     onCheckedChange={setShowBeatGrid}
                     className="h-4 w-7"
                   />
                   <span className="text-[9px] text-muted-foreground">Beats</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <Switch
                     checked={showSectionMarkers}
                     onCheckedChange={setShowSectionMarkers}
                     className="h-4 w-7"
                   />
                   <span className="text-[9px] text-muted-foreground">Sections</span>
                 </div>
               </div>
 
               {/* Zoom */}
               <div className="flex items-center gap-1.5 w-24">
                 <Maximize2 className="w-3 h-3 text-muted-foreground" />
                 <Slider
                   value={[zoom]}
                   onValueChange={([val]) => setZoom(val)}
                   min={50}
                   max={200}
                   step={10}
                   className="flex-1"
                 />
               </div>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
 }