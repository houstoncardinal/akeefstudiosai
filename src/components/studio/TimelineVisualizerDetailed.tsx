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
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Info,
  FileVideo,
  Image,
  AudioLines,
  Ratio,
  Gauge,
  HardDrive,
  Timer,
  Waves,
  MonitorPlay,
  ChevronDown,
  ChevronUp,
  Palette
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type VideoFormat } from '@/lib/formats';

interface TimelineVisualizerDetailedProps {
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

interface ClipInfo {
  start: number;
  duration: number;
  type: 'a-roll' | 'b-roll';
  name: string;
  thumbnail?: string;
  resolution?: string;
  fps?: number;
}

export default function TimelineVisualizerDetailed({ 
  fileContent, 
  isProcessing, 
  detectedFormat,
  detectedBPM 
}: TimelineVisualizerDetailedProps) {
  const [showBeatGrid, setShowBeatGrid] = useState(true);
  const [showEnergyGraph, setShowEnergyGraph] = useState(true);
  const [showCutFrequency, setShowCutFrequency] = useState(false);
  const [showSectionMarkers, setShowSectionMarkers] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [activeView, setActiveView] = useState<'timeline' | 'energy' | 'rhythm' | 'details'>('timeline');
  const [showMediaInfo, setShowMediaInfo] = useState(true);
  const [selectedClip, setSelectedClip] = useState<number | null>(null);
  
  const isVideoFile = detectedFormat && detectedFormat.category !== 'timeline';

  // Generate realistic media metadata
  const mediaMetadata = useMemo(() => ({
    duration: '02:34:18',
    totalFrames: 4618,
    resolution: '3840x2160',
    fps: 23.976,
    codec: 'H.264 (High Profile)',
    bitrate: '45.2 Mbps',
    colorSpace: 'Rec.709',
    audioChannels: '5.1 Surround',
    audioSampleRate: '48kHz',
    fileSize: '892 MB',
    createdDate: 'Jan 15, 2025',
    cameraModel: 'Sony FX6',
  }), []);

  // Parse clips from content with more detail
  const clips: ClipInfo[] = useMemo(() => {
    if (isVideoFile) {
      return Array.from({ length: 12 }, (_, i) => ({
        start: i * 8,
        duration: 6 + Math.random() * 4,
        type: i % 3 === 0 ? 'a-roll' as const : 'b-roll' as const,
        name: i % 3 === 0 ? `INT_${['Interview', 'Dialog', 'Reaction'][i % 3]}_${i+1}` : `BROLL_${['Cityscape', 'Nature', 'Detail', 'Aerial'][i % 4]}_${i+1}`,
        resolution: ['4K', '4K', '1080p', '4K'][i % 4],
        fps: [23.976, 24, 29.97, 59.94][i % 4],
      }));
    }
    
    if (!fileContent) return [];
    const matches = fileContent.match(/<(clip|asset-clip)[^>]*>/g) || [];
    let pos = 0;
    return matches.slice(0, 15).map((_, i) => {
      const dur = 4 + Math.random() * 8;
      const clip: ClipInfo = { 
        start: pos, 
        duration: Math.min(dur, 100 - pos),
        type: i % 3 === 0 ? 'a-roll' : 'b-roll',
        name: `Clip_${String(i + 1).padStart(3, '0')}`,
        resolution: '4K',
        fps: 23.976,
      };
      pos += dur + 0.2;
      return clip;
    });
  }, [fileContent, isVideoFile]);

  // Generate beat grid based on BPM
  const beatMarkers = useMemo(() => {
    if (!detectedBPM) return [];
    const beatsPerSecond = detectedBPM / 60;
    const totalSeconds = 120;
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

  // Generate section markers with more detail
  const sectionMarkers: Marker[] = useMemo(() => [
    { position: 0, type: 'section', label: 'INTRO' },
    { position: 12, type: 'section', label: 'VERSE 1' },
    { position: 28, type: 'section', label: 'PRE-CHORUS' },
    { position: 38, type: 'section', label: 'CHORUS' },
    { position: 55, type: 'section', label: 'VERSE 2' },
    { position: 68, type: 'section', label: 'BRIDGE' },
    { position: 82, type: 'section', label: 'FINAL CHORUS' },
    { position: 92, type: 'section', label: 'OUTRO' },
  ], []);

  // Generate energy curve data
  const energyData = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => {
      const x = i / 80;
      const base = 0.25;
      const verse = Math.sin(x * Math.PI * 4) * 0.12;
      const chorus = (x > 0.35 && x < 0.55) || (x > 0.8 && x < 0.92) ? 0.45 : 0;
      const buildup = x > 0.3 && x < 0.38 ? (x - 0.3) * 3 : 0;
      const drop = x > 0.7 && x < 0.75 ? 0.3 : 0;
      const noise = Math.random() * 0.08;
      return Math.min(1, Math.max(0.1, base + verse + chorus + buildup + drop + noise));
    }),
  []);

  // Generate cut frequency data
  const cutFrequencyData = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => {
      const position = i / 50;
      if ((position > 0.35 && position < 0.55) || (position > 0.8 && position < 0.92)) return 0.65 + Math.random() * 0.3;
      if (position > 0.68 && position < 0.8) return 0.5 + Math.random() * 0.25;
      return 0.15 + Math.random() * 0.25;
    }),
  []);

  // Generate detailed waveform
  const waveform = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => {
      const base = 25 + Math.random() * 40;
      const beat = i % 8 === 0 ? 20 : 0;
      return Math.min(95, base + beat);
    }),
  []);

  // Format timecode
  const formatTimecode = (percent: number) => {
    const totalSeconds = (percent / 100) * 154; // 2:34
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const frames = Math.floor((totalSeconds % 1) * 24);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  if (!fileContent && !isVideoFile) {
    return (
      <div className="panel h-full relative overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Timeline Visualizer</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-[220px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 flex items-center justify-center mb-3">
            <Film className="w-6 h-6 text-muted-foreground" />
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
          <Badge variant="outline" className="text-[9px] gap-1">
            <Film className="w-2.5 h-2.5" />
            {clips.length} clips
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono">
            {mediaMetadata.duration}
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
            <TabsTrigger value="details" className="text-[10px] h-6 px-3 gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Info className="w-3 h-3" />
              Details
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-2">
        {/* Media Details Panel */}
        {activeView === 'details' && (
          <div className="space-y-3">
            {/* Media Info Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <MonitorPlay className="w-3 h-3 text-primary" />
                  <span className="text-[9px] text-muted-foreground uppercase">Resolution</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{mediaMetadata.resolution}</p>
                <p className="text-[9px] text-muted-foreground">{mediaMetadata.fps} fps</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileVideo className="w-3 h-3 text-accent" />
                  <span className="text-[9px] text-muted-foreground uppercase">Codec</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{mediaMetadata.codec}</p>
                <p className="text-[9px] text-muted-foreground">{mediaMetadata.bitrate}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Timer className="w-3 h-3 text-success" />
                  <span className="text-[9px] text-muted-foreground uppercase">Duration</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{mediaMetadata.duration}</p>
                <p className="text-[9px] text-muted-foreground">{mediaMetadata.totalFrames} frames</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <Palette className="w-3 h-3 text-magenta" />
                  <span className="text-[9px] text-muted-foreground uppercase">Color</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{mediaMetadata.colorSpace}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <AudioLines className="w-3 h-3 text-cyan" />
                  <span className="text-[9px] text-muted-foreground uppercase">Audio</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{mediaMetadata.audioChannels}</p>
                <p className="text-[9px] text-muted-foreground">{mediaMetadata.audioSampleRate}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-3 h-3 text-yellow-500" />
                  <span className="text-[9px] text-muted-foreground uppercase">Size</span>
                </div>
                <p className="text-xs font-semibold text-foreground">{mediaMetadata.fileSize}</p>
              </div>
            </div>

            {/* Clip List */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Detected Clips</span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                {clips.slice(0, 8).map((clip, i) => (
                  <div 
                    key={i}
                    className={cn(
                      'flex items-center gap-2 p-1.5 rounded border transition-colors cursor-pointer',
                      selectedClip === i 
                        ? 'bg-primary/10 border-primary/30' 
                        : 'bg-muted/20 border-border/30 hover:bg-muted/40'
                    )}
                    onClick={() => setSelectedClip(selectedClip === i ? null : i)}
                  >
                    <div className={cn(
                      'w-10 h-6 rounded flex items-center justify-center text-[8px] font-mono',
                      clip.type === 'a-roll' ? 'bg-primary/30 text-primary' : 'bg-accent/30 text-accent'
                    )}>
                      {clip.type === 'a-roll' ? 'A' : 'B'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-foreground truncate">{clip.name}</p>
                      <p className="text-[9px] text-muted-foreground">{clip.resolution} • {clip.fps}fps</p>
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground">{clip.duration.toFixed(1)}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView !== 'details' && (
          <>
            {/* Timecode ruler */}
            <div className="flex text-[8px] text-muted-foreground uppercase font-mono relative">
              {['00:00:00', '00:38:12', '01:16:24', '01:54:36', '02:34:18'].map((t, i) => (
                <div key={i} className="flex-1 text-center relative">
                  <span>{t}</span>
                  <div className="absolute bottom-0 left-1/2 w-px h-1.5 bg-border/50 transform -translate-x-1/2" />
                </div>
              ))}
            </div>

            {/* Section Markers */}
            {showSectionMarkers && (
              <div className="relative h-5 rounded bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20 border border-border/30">
                {sectionMarkers.map((marker, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full flex items-center"
                    style={{ left: `${marker.position}%` }}
                  >
                    <div className="h-full w-0.5 bg-gradient-to-b from-accent to-accent/30" />
                    <span className="text-[7px] text-accent font-bold ml-1 whitespace-nowrap tracking-wider">
                      {marker.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Beat Grid Overlay */}
            {showBeatGrid && detectedBPM && activeView === 'rhythm' && (
              <div className="relative h-8 rounded bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30 overflow-hidden">
                {beatMarkers.map((marker, i) => {
                  const isDownbeat = marker.label !== undefined;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'absolute top-0 h-full',
                        isDownbeat ? 'w-0.5 bg-primary/70' : 'w-px bg-primary/20'
                      )}
                      style={{ left: `${marker.position}%` }}
                    >
                      {isDownbeat && (
                        <span className="absolute -top-0.5 left-1 text-[7px] text-primary font-bold">
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
                  <span className="text-[8px] text-primary font-mono ml-auto">Peak: 94%</span>
                </div>
                <div className="h-14 rounded bg-muted/20 border border-border/30 flex items-end p-1 gap-px overflow-hidden">
                  {energyData.map((value, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-t-sm transition-all duration-150',
                        value > 0.75 ? 'bg-gradient-to-t from-accent via-primary to-primary/80' :
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
                  <span className="text-[8px] text-magenta font-mono ml-auto">Avg: 2.3/sec</span>
                </div>
                <div className="h-10 rounded bg-muted/20 border border-border/30 flex items-end p-1 gap-0.5 overflow-hidden">
                  {cutFrequencyData.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-magenta/70 to-magenta/30 rounded-t-sm"
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
                  <div className="flex-1 h-12 rounded bg-muted/40 relative overflow-hidden border border-border/30">
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
                          'absolute h-full rounded border-l-2 transition-all duration-300 cursor-pointer group',
                          isProcessing && 'opacity-70',
                          selectedClip === i && 'ring-2 ring-white/50',
                          c.type === 'a-roll' 
                            ? 'bg-gradient-to-r from-primary/60 to-primary/40 border-primary hover:from-primary/70' 
                            : i % 2 === 0 
                              ? 'bg-gradient-to-r from-accent/60 to-accent/40 border-accent hover:from-accent/70' 
                              : 'bg-gradient-to-r from-magenta/60 to-magenta/40 border-magenta hover:from-magenta/70'
                        )}
                        style={{ left: `${c.start}%`, width: `${c.duration}%` }}
                        onClick={() => setSelectedClip(selectedClip === i ? null : i)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
                        <div className="absolute inset-x-0 top-0.5 px-1 flex items-center justify-between">
                          <span className="text-[7px] text-white/90 font-bold truncate">
                            {c.type === 'a-roll' ? 'A' : 'B'}-{i+1}
                          </span>
                          <span className="text-[6px] text-white/60 font-mono hidden group-hover:block">
                            {c.duration.toFixed(1)}s
                          </span>
                        </div>
                        {/* Thumbnail placeholder */}
                        <div className="absolute bottom-0.5 left-0.5 right-0.5 h-4 bg-black/30 rounded-sm flex items-center justify-center">
                          <Image className="w-2.5 h-2.5 text-white/40" />
                        </div>
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
                  <div className="flex-1 h-8 rounded bg-muted/40 flex items-end px-0.5 gap-[1px] overflow-hidden border border-border/30">
                    {waveform.map((h, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 min-w-[1px] max-w-[3px] bg-gradient-to-t from-success/70 to-success/30 rounded-t-sm transition-all',
                          isProcessing && 'animate-waveform'
                        )}
                        style={{ height: `${h}%`, animationDelay: `${i * 0.02}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Audio track A2 (music) */}
                <div className="flex items-center gap-2">
                  <div className="w-10 flex items-center gap-1">
                    <Music className="w-3 h-3 text-accent/60" />
                    <span className="text-[9px] text-muted-foreground font-mono">A2</span>
                  </div>
                  <div className="flex-1 h-6 rounded bg-muted/40 flex items-end px-0.5 gap-[1px] overflow-hidden border border-border/30">
                    {waveform.slice(0, 80).map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 min-w-[1px] max-w-[4px] bg-gradient-to-t from-accent/60 to-accent/20 rounded-t-sm"
                        style={{ height: `${h * 0.7}%` }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Playhead & Transport */}
        {activeView !== 'details' && (
          <div className="pt-2 space-y-2">
            <div className="relative h-2.5 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary via-primary to-accent rounded-full transition-all duration-200"
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
                className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background shadow-lg shadow-primary/30 transition-all duration-200"
                style={{ left: `calc(${playheadPosition}% - 7px)` }}
              />
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10">
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-8 w-8 p-0", isPlaying && "bg-primary/20")}
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-primary/10">
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
                <div className="ml-2 px-2 py-0.5 bg-muted/50 rounded border border-border/30">
                  <span className="text-[11px] font-mono text-foreground font-medium">
                    {formatTimecode(playheadPosition)}
                  </span>
                </div>
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
                  {activeView === 'energy' && (
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={showCutFrequency}
                        onCheckedChange={setShowCutFrequency}
                        className="h-4 w-7"
                      />
                      <span className="text-[9px] text-muted-foreground">Cuts</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
