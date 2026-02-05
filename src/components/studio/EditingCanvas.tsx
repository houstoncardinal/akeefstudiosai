import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Film,
  Music,
  Palette,
  Zap,
  Type,
  Layers,
  Clock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Trash2,
  Copy,
  Scissors,
  Move,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wand2,
  Image,
  AudioLines,
  GripVertical,
  Settings,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { type VideoFormat } from '@/lib/formats';

// Effect types for visual indicators
interface ClipEffect {
  id: string;
  type: 'color' | 'transition' | 'speed' | 'audio' | 'graphics' | 'filter';
  name: string;
  icon: typeof Palette;
  color: string;
}

interface TimelineClip {
  id: string;
  name: string;
  start: number;
  duration: number;
  track: number;
  type: 'video' | 'audio' | 'title' | 'image';
  effects: ClipEffect[];
  thumbnail?: string;
  locked: boolean;
  muted: boolean;
  visible: boolean;
}

interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'overlay';
  locked: boolean;
  visible: boolean;
  muted: boolean;
  height: number;
  collapsed: boolean;
}

interface EditingCanvasProps {
  file: File | null;
  detectedFormat: VideoFormat | null;
  colorGrade: string;
  effectPreset: string;
  transitions: string[];
  graphics: string[];
  isProcessing: boolean;
}

// Sample effects based on current config
const EFFECT_ICONS: Record<string, { icon: typeof Palette; color: string }> = {
  color: { icon: Palette, color: 'text-amber-500 bg-amber-500/20' },
  transition: { icon: Zap, color: 'text-purple-500 bg-purple-500/20' },
  speed: { icon: Clock, color: 'text-blue-500 bg-blue-500/20' },
  audio: { icon: Volume2, color: 'text-green-500 bg-green-500/20' },
  graphics: { icon: Type, color: 'text-pink-500 bg-pink-500/20' },
  filter: { icon: Sparkles, color: 'text-cyan-500 bg-cyan-500/20' },
};

export default function EditingCanvas({
  file,
  detectedFormat,
  colorGrade,
  effectPreset,
  transitions,
  graphics,
  isProcessing,
}: EditingCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: 'v1', name: 'Video 1', type: 'video', locked: false, visible: true, muted: false, height: 80, collapsed: false },
    { id: 'v2', name: 'Video 2', type: 'overlay', locked: false, visible: true, muted: false, height: 60, collapsed: false },
    { id: 'a1', name: 'Audio 1', type: 'audio', locked: false, visible: true, muted: false, height: 50, collapsed: false },
    { id: 'a2', name: 'Audio 2', type: 'audio', locked: false, visible: true, muted: false, height: 50, collapsed: true },
  ]);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const totalDuration = 120; // 2 minutes in seconds
  
  // Generate sample clips with effects based on current settings
  const clips: TimelineClip[] = useMemo(() => {
    if (!file) return [];
    
    const baseClips: TimelineClip[] = [];
    
    // Video clips on track 1
    const videoClipNames = ['Interview_A', 'B-Roll_City', 'Interview_B', 'B-Roll_Nature', 'Closing_Shot'];
    let currentPos = 0;
    
    videoClipNames.forEach((name, i) => {
      const duration = 15 + Math.random() * 10;
      const clipEffects: ClipEffect[] = [];
      
      // Add color grade effect if active
      if (colorGrade && colorGrade !== 'none') {
        clipEffects.push({
          id: `color-${i}`,
          type: 'color',
          name: colorGrade.replace(/_/g, ' '),
          icon: Palette,
          color: 'text-amber-500 bg-amber-500/20',
        });
      }
      
      // Add effect preset
      if (effectPreset && effectPreset !== 'none') {
        clipEffects.push({
          id: `filter-${i}`,
          type: 'filter',
          name: effectPreset.replace(/_/g, ' '),
          icon: Sparkles,
          color: 'text-cyan-500 bg-cyan-500/20',
        });
      }
      
      // Add transition if applicable
      if (transitions.length > 0 && i > 0) {
        clipEffects.push({
          id: `trans-${i}`,
          type: 'transition',
          name: transitions[i % transitions.length]?.replace(/_/g, ' ') || 'Cross Dissolve',
          icon: Zap,
          color: 'text-purple-500 bg-purple-500/20',
        });
      }
      
      // Random speed effect
      if (Math.random() > 0.7) {
        clipEffects.push({
          id: `speed-${i}`,
          type: 'speed',
          name: Math.random() > 0.5 ? 'Slow Motion 50%' : 'Speed Ramp',
          icon: Clock,
          color: 'text-blue-500 bg-blue-500/20',
        });
      }
      
      baseClips.push({
        id: `clip-v1-${i}`,
        name,
        start: currentPos,
        duration,
        track: 0,
        type: 'video',
        effects: clipEffects,
        locked: false,
        muted: false,
        visible: true,
      });
      
      currentPos += duration + 0.5;
    });
    
    // Add some overlay clips (track 2)
    if (graphics.length > 0) {
      graphics.slice(0, 3).forEach((g, i) => {
        baseClips.push({
          id: `clip-v2-${i}`,
          name: g.replace(/_/g, ' '),
          start: 10 + i * 30,
          duration: 8,
          track: 1,
          type: 'title',
          effects: [{
            id: `gfx-${i}`,
            type: 'graphics',
            name: 'Title Animation',
            icon: Type,
            color: 'text-pink-500 bg-pink-500/20',
          }],
          locked: false,
          muted: false,
          visible: true,
        });
      });
    }
    
    // Add audio clips
    baseClips.push({
      id: 'clip-a1-1',
      name: 'Background Music',
      start: 0,
      duration: 90,
      track: 2,
      type: 'audio',
      effects: [{
        id: 'audio-1',
        type: 'audio',
        name: 'Fade In/Out',
        icon: Volume2,
        color: 'text-green-500 bg-green-500/20',
      }],
      locked: false,
      muted: false,
      visible: true,
    });
    
    baseClips.push({
      id: 'clip-a1-2',
      name: 'Voiceover',
      start: 5,
      duration: 70,
      track: 3,
      type: 'audio',
      effects: [],
      locked: false,
      muted: false,
      visible: true,
    });
    
    return baseClips;
  }, [file, colorGrade, effectPreset, transitions, graphics]);
  
  // Playhead animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayheadPosition(prev => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);
  
  const handleClipClick = useCallback((clipId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      setSelectedClips(prev => 
        prev.includes(clipId) ? prev.filter(id => id !== clipId) : [...prev, clipId]
      );
    } else {
      setSelectedClips([clipId]);
    }
  }, []);
  
  const toggleTrackCollapse = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, collapsed: !t.collapsed } : t
    ));
  };
  
  const toggleTrackLock = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, locked: !t.locked } : t
    ));
  };
  
  const toggleTrackVisibility = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, visible: !t.visible } : t
    ));
  };
  
  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(t => 
      t.id === trackId ? { ...t, muted: !t.muted } : t
    ));
  };
  
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };
  
  const getClipWidth = (duration: number) => {
    return (duration / totalDuration) * 100 * (zoom / 100);
  };
  
  const getClipLeft = (start: number) => {
    return (start / totalDuration) * 100 * (zoom / 100);
  };
  
  // Empty state
  if (!file) {
    return (
      <div className="panel h-full relative overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Editing Canvas</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-[300px] text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 flex items-center justify-center mb-4">
            <Layers className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No media loaded</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-[280px]">
            Import a video or timeline to start editing with visual effect indicators
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse z-20 pointer-events-none" />
      )}
      
      {/* Header */}
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Editing Canvas</span>
          <Badge variant="outline" className="text-[9px] ml-1">
            {clips.length} clips
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-mono">
            {formatTimecode(playheadPosition)}
          </Badge>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/40 bg-muted/20 flex-shrink-0">
        {/* Transport */}
        <div className="flex items-center gap-0.5 mr-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPlayheadPosition(0)}
          >
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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPlayheadPosition(Math.min(totalDuration, playheadPosition + 5))}
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
        
        <div className="w-px h-5 bg-border/50" />
        
        {/* Edit tools */}
        <div className="flex items-center gap-0.5 mx-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Scissors className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Split clip (S)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete (Del)</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex-1" />
        
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setZoom(prev => Math.max(25, prev - 25))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setZoom(prev => Math.min(400, prev + 25))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* Timeline ruler */}
      <div className="flex items-center h-6 bg-muted/30 border-b border-border/40 flex-shrink-0">
        <div className="w-[140px] flex-shrink-0" />
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="flex h-full"
            style={{ width: `${zoom}%` }}
          >
            {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => (
              <div key={i} className="flex-1 relative h-full border-r border-border/30">
                <span className="absolute top-1 left-1 text-[8px] font-mono text-muted-foreground">
                  {formatTimecode(i * 10)}
                </span>
                {/* Minor ticks */}
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="absolute bottom-0 w-px h-1.5 bg-border/40"
                    style={{ left: `${(j + 1) * 20}%` }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Playhead marker on ruler */}
          <div
            className="absolute top-0 h-full w-0.5 bg-primary z-30"
            style={{ left: `${(playheadPosition / totalDuration) * zoom}%` }}
          >
            <div className="absolute -top-0.5 -left-1.5 w-3 h-3 bg-primary rounded-sm" />
          </div>
        </div>
      </div>
      
      {/* Tracks area */}
      <ScrollArea className="flex-1">
        <div className="flex min-h-full">
          {/* Track headers */}
          <div className="w-[140px] flex-shrink-0 border-r border-border/40 bg-card/50">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={cn(
                  "border-b border-border/30 flex items-center px-2 gap-1 transition-all",
                  track.collapsed ? 'h-7' : track.type === 'video' ? 'h-20' : 'h-12'
                )}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => toggleTrackCollapse(track.id)}
                >
                  {track.collapsed ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                </Button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {track.type === 'video' && <Film className="w-3 h-3 text-primary" />}
                    {track.type === 'overlay' && <Layers className="w-3 h-3 text-accent" />}
                    {track.type === 'audio' && <AudioLines className="w-3 h-3 text-green-500" />}
                    <span className="text-[10px] font-medium truncate">{track.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-5 w-5 p-0", track.locked && "text-warning")}
                    onClick={() => toggleTrackLock(track.id)}
                  >
                    {track.locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("h-5 w-5 p-0", !track.visible && "text-muted-foreground/50")}
                    onClick={() => toggleTrackVisibility(track.id)}
                  >
                    {track.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                  </Button>
                  {track.type === 'audio' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-5 w-5 p-0", track.muted && "text-destructive")}
                      onClick={() => toggleTrackMute(track.id)}
                    >
                      {track.muted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Timeline content */}
          <div 
            ref={timelineRef}
            className="flex-1 relative overflow-x-auto"
          >
            <div 
              className="relative"
              style={{ width: `${zoom}%`, minWidth: '100%' }}
            >
              {tracks.map((track, trackIndex) => (
                <div
                  key={track.id}
                  className={cn(
                    "relative border-b border-border/30 bg-gradient-to-b transition-all",
                    track.type === 'video' && 'from-primary/5 to-transparent',
                    track.type === 'overlay' && 'from-accent/5 to-transparent',
                    track.type === 'audio' && 'from-green-500/5 to-transparent',
                    track.collapsed ? 'h-7' : track.type === 'video' ? 'h-20' : 'h-12',
                    !track.visible && 'opacity-40'
                  )}
                >
                  {/* Clips in this track */}
                  {clips
                    .filter(clip => clip.track === trackIndex)
                    .map(clip => {
                      const isSelected = selectedClips.includes(clip.id);
                      const clipWidth = getClipWidth(clip.duration);
                      const clipLeft = getClipLeft(clip.start);
                      
                      return (
                        <div
                          key={clip.id}
                          className={cn(
                            "absolute top-1 bottom-1 rounded-md cursor-pointer transition-all group overflow-hidden",
                            "border-2 shadow-sm hover:shadow-md",
                            clip.type === 'video' && 'bg-gradient-to-b from-primary/20 to-primary/10 border-primary/40',
                            clip.type === 'audio' && 'bg-gradient-to-b from-green-500/20 to-green-500/10 border-green-500/40',
                            clip.type === 'title' && 'bg-gradient-to-b from-pink-500/20 to-pink-500/10 border-pink-500/40',
                            clip.type === 'image' && 'bg-gradient-to-b from-accent/20 to-accent/10 border-accent/40',
                            isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background border-primary',
                            clip.locked && 'opacity-60 cursor-not-allowed',
                            !clip.visible && 'opacity-30'
                          )}
                          style={{
                            left: `${clipLeft}%`,
                            width: `${clipWidth}%`,
                            minWidth: '60px',
                          }}
                          onClick={(e) => handleClipClick(clip.id, e)}
                        >
                          {/* Clip header */}
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/10">
                            <GripVertical className="w-2.5 h-2.5 text-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[9px] font-medium text-foreground/80 truncate flex-1">
                              {clip.name}
                            </span>
                            {clip.locked && <Lock className="w-2.5 h-2.5 text-warning" />}
                            {clip.muted && <VolumeX className="w-2.5 h-2.5 text-destructive" />}
                          </div>
                          
                          {/* Effect indicators - Visual badges showing applied effects */}
                          {!track.collapsed && clip.effects.length > 0 && (
                            <div className="flex flex-wrap gap-0.5 px-1.5 py-1">
                              {clip.effects.slice(0, 4).map((effect) => {
                                const Icon = effect.icon;
                                return (
                                  <Tooltip key={effect.id}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-medium",
                                          effect.color
                                        )}
                                      >
                                        <Icon className="w-2.5 h-2.5" />
                                        <span className="hidden sm:inline truncate max-w-[60px]">
                                          {effect.name}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <div className="flex items-center gap-1">
                                        <Icon className="w-3 h-3" />
                                        <span className="capitalize">{effect.type}:</span>
                                        <span>{effect.name}</span>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                              {clip.effects.length > 4 && (
                                <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                                  +{clip.effects.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          {/* Waveform visualization for audio */}
                          {clip.type === 'audio' && !track.collapsed && (
                            <div className="absolute bottom-1 inset-x-1 h-3 flex items-end gap-px overflow-hidden">
                              {Array.from({ length: Math.min(50, Math.floor(clip.duration * 2)) }).map((_, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-green-500/40 rounded-t"
                                  style={{ height: `${20 + Math.random() * 80}%` }}
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Resize handles */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-primary/50 transition-colors" />
                          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-primary/50 transition-colors" />
                          
                          {/* Clip context menu trigger */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-0.5 right-0.5 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="text-xs gap-2">
                                <Palette className="w-3.5 h-3.5" />
                                Add Color Grade
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2">
                                <Sparkles className="w-3.5 h-3.5" />
                                Add Effect
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2">
                                <Zap className="w-3.5 h-3.5" />
                                Add Transition
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2">
                                <Clock className="w-3.5 h-3.5" />
                                Speed / Duration
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2">
                                <Scissors className="w-3.5 h-3.5" />
                                Split Clip
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2">
                                <Copy className="w-3.5 h-3.5" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2 text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Clip
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })}
                </div>
              ))}
              
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-30 pointer-events-none"
                style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
              >
                <div className="absolute top-0 -left-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background" />
              </div>
            </div>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Footer status */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/40 bg-muted/20 text-[10px] text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>{selectedClips.length > 0 ? `${selectedClips.length} selected` : 'No selection'}</span>
          <span className="text-border">|</span>
          <span>{tracks.length} tracks</span>
          <span className="text-border">|</span>
          <span>{clips.length} clips</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatTimecode(totalDuration)} total</span>
          {effectPreset && effectPreset !== 'none' && (
            <Badge variant="outline" className="text-[8px] gap-1">
              <Sparkles className="w-2 h-2" />
              {effectPreset.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
