import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
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
  Image,
  AudioLines,
  GripVertical,
  MoreHorizontal,
  Magnet,
  GitBranch,
  Flag,
  Activity,
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
import { type VideoFormat } from '@/lib/formats';
import { type AudioAnalysisResult } from '@/lib/audioAnalysis';
import { type VideoAnalysisResult } from '@/lib/videoAnalysis';

// ═══════════════════════════════════════════════════════════════════
// PROFESSIONAL TIMELINE TYPES
// ═══════════════════════════════════════════════════════════════════

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
  inPoint: number;
  outPoint: number;
  track: number;
  type: 'video' | 'audio' | 'title' | 'image';
  effects: ClipEffect[];
  thumbnailUrl?: string;
  locked: boolean;
  muted: boolean;
  visible: boolean;
  speed: number;
  volume: number;
  waveform?: number[];
  sceneIndex?: number;
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
  solo: boolean;
}

interface TimelineMarker {
  id: string;
  time: number;
  label: string;
  color: string;
  type: 'scene' | 'beat' | 'user' | 'chapter';
}

interface EditingCanvasProps {
  file: File | null;
  detectedFormat: VideoFormat | null;
  colorGrade: string;
  effectPreset: string;
  transitions: string[];
  graphics: string[];
  isProcessing: boolean;
  // Real analysis data
  audioAnalysis?: AudioAnalysisResult | null;
  videoAnalysis?: VideoAnalysisResult | null;
  // Callbacks
  onClipSelect?: (clipId: string | null) => void;
  onPlayheadChange?: (time: number) => void;
}

// Effect icon/color lookup
const EFFECT_ICONS: Record<string, { icon: typeof Palette; color: string }> = {
  color: { icon: Palette, color: 'text-amber-500 bg-amber-500/20' },
  transition: { icon: Zap, color: 'text-purple-500 bg-purple-500/20' },
  speed: { icon: Clock, color: 'text-blue-500 bg-blue-500/20' },
  audio: { icon: Volume2, color: 'text-green-500 bg-green-500/20' },
  graphics: { icon: Type, color: 'text-pink-500 bg-pink-500/20' },
  filter: { icon: Sparkles, color: 'text-cyan-500 bg-cyan-500/20' },
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function EditingCanvas({
  file,
  detectedFormat,
  colorGrade,
  effectPreset,
  transitions,
  graphics,
  isProcessing,
  audioAnalysis,
  videoAnalysis,
  onClipSelect,
  onPlayheadChange,
}: EditingCanvasProps) {
  // ─── State ───
  const [zoom, setZoom] = useState(100);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [rippleEnabled, setRippleEnabled] = useState(false);
  const [showWaveforms, setShowWaveforms] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showBeatGrid, setShowBeatGrid] = useState(true);
  
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: 'v1', name: 'Video 1', type: 'video', locked: false, visible: true, muted: false, height: 80, collapsed: false, solo: false },
    { id: 'v2', name: 'Overlay', type: 'overlay', locked: false, visible: true, muted: false, height: 60, collapsed: false, solo: false },
    { id: 'a1', name: 'Audio 1', type: 'audio', locked: false, visible: true, muted: false, height: 50, collapsed: false, solo: false },
    { id: 'a2', name: 'Music', type: 'audio', locked: false, visible: true, muted: false, height: 50, collapsed: true, solo: false },
  ]);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // ─── Generate static video thumbnail from file (once) ───
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  
  useEffect(() => {
    if (!file || !file.type.startsWith('video/')) {
      setVideoThumbnail(null);
      return;
    }
    
    // Create a video element to capture a frame
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.preload = 'metadata';
    
    const captureFrame = () => {
      // Seek to 1 second for thumbnail
      video.currentTime = 1;
    };
    
    const drawFrame = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setVideoThumbnail(canvas.toDataURL('image/jpeg', 0.7));
      }
      URL.revokeObjectURL(url);
      video.remove();
    };
    
    video.addEventListener('loadedmetadata', captureFrame);
    video.addEventListener('seeked', drawFrame);
    video.load();
    
    return () => {
      URL.revokeObjectURL(url);
      video.remove();
    };
  }, [file]);
  
  // ─── Derived values from real analysis ───
  const totalDuration = useMemo(() => {
    if (audioAnalysis?.duration) return audioAnalysis.duration;
    if (videoAnalysis?.duration) return videoAnalysis.duration;
    return 120; // default 2 minutes
  }, [audioAnalysis, videoAnalysis]);
  
  const detectedBPM = audioAnalysis?.bpm || null;
  const beatTimestamps = audioAnalysis?.beatTimestamps || [];
  const energyCurve = audioAnalysis?.energyCurve || [];
  const sceneChanges = videoAnalysis?.sceneChanges || [];
  
  // ─── Generate markers from real data ───
  const markers: TimelineMarker[] = useMemo(() => {
    const result: TimelineMarker[] = [];
    
    // Add scene change markers
    sceneChanges.forEach((scene, i) => {
      result.push({
        id: `scene-${i}`,
        time: scene.timestamp,
        label: `Scene ${i + 1}`,
        color: 'hsl(280, 100%, 60%)',
        type: 'scene',
      });
    });
    
    // Add beat markers (only major beats every 4)
    if (showBeatGrid) {
      beatTimestamps.filter((_, i) => i % 4 === 0).forEach((time, i) => {
        result.push({
          id: `beat-${i}`,
          time,
          label: `Beat ${i * 4 + 1}`,
          color: 'hsl(160, 100%, 50%)',
          type: 'beat',
        });
      });
    }
    
    return result;
  }, [sceneChanges, beatTimestamps, showBeatGrid]);
  
  // ─── Generate clips from REAL scene analysis ───
  const clips: TimelineClip[] = useMemo(() => {
    if (!file) return [];
    
    const baseClips: TimelineClip[] = [];
    
    // If we have scene analysis, create clips from actual scenes
    if (sceneChanges.length > 0) {
      sceneChanges.forEach((scene, i) => {
        const nextScene = sceneChanges[i + 1];
        const duration = nextScene 
          ? nextScene.timestamp - scene.timestamp 
          : totalDuration - scene.timestamp;
        
        const clipEffects: ClipEffect[] = [];
        
        // Add color grade if active
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
        
        baseClips.push({
          id: `clip-v1-${i}`,
          name: `Scene ${i + 1}`,
          start: scene.timestamp,
          duration: Math.max(duration, 0.5),
          inPoint: 0,
          outPoint: duration,
          track: 0,
          type: 'video',
          effects: clipEffects,
          locked: false,
          muted: false,
          visible: true,
          speed: 1,
          volume: 1,
          sceneIndex: i,
        });
      });
    } else {
      // Fallback: create placeholder clips if no analysis - use DETERMINISTIC values
      const placeholderClips = [
        { name: 'Opening', duration: 18 },
        { name: 'Main Content', duration: 22 },
        { name: 'B-Roll', duration: 15 },
        { name: 'Interview', duration: 25 },
        { name: 'Closing', duration: 12 },
      ];
      let pos = 0;
      placeholderClips.forEach((clip, i) => {
        const clipEffects: ClipEffect[] = [];
        if (colorGrade && colorGrade !== 'none') {
          clipEffects.push({
            id: `color-${i}`,
            type: 'color',
            name: colorGrade.replace(/_/g, ' '),
            icon: Palette,
            color: 'text-amber-500 bg-amber-500/20',
          });
        }
        
        baseClips.push({
          id: `clip-v1-${i}`,
          name: clip.name,
          start: pos,
          duration: clip.duration,
          inPoint: 0,
          outPoint: clip.duration,
          track: 0,
          type: 'video',
          effects: clipEffects,
          locked: false,
          muted: false,
          visible: true,
          speed: 1,
          volume: 1,
        });
        pos += clip.duration + 0.5;
      });
    }
    
    // Add overlay graphics from config
    if (graphics.length > 0) {
      graphics.slice(0, 3).forEach((g, i) => {
        baseClips.push({
          id: `clip-v2-${i}`,
          name: g.replace(/_/g, ' '),
          start: 10 + i * 30,
          duration: 8,
          inPoint: 0,
          outPoint: 8,
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
          speed: 1,
          volume: 1,
        });
      });
    }
    
    // Add audio track with stable waveform data
    const audioWaveform = energyCurve.length > 0 
      ? energyCurve 
      : [0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7, 0.3, 0.6, 0.8, 0.4, 0.9, 0.5,
         0.4, 0.6, 0.7, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.6, 0.8, 0.4, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8, 0.5];
    
    baseClips.push({
      id: 'clip-a1-1',
      name: audioAnalysis ? 'Analyzed Audio' : 'Background Audio',
      start: 0,
      duration: totalDuration * 0.8,
      inPoint: 0,
      outPoint: totalDuration * 0.8,
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
      speed: 1,
      volume: 1,
      waveform: audioWaveform,
    });
    
    return baseClips;
  }, [file, colorGrade, effectPreset, transitions, graphics, sceneChanges, totalDuration, energyCurve, audioAnalysis]);
  
  // ─── Playhead animation ───
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayheadPosition(prev => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }
        onPlayheadChange?.(next);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, onPlayheadChange]);
  
  // ─── Handlers ───
  const handleClipClick = useCallback((clipId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      setSelectedClips(prev => 
        prev.includes(clipId) ? prev.filter(id => id !== clipId) : [...prev, clipId]
      );
    } else {
      setSelectedClips([clipId]);
    }
    onClipSelect?.(clipId);
  }, [onClipSelect]);
  
  const toggleTrackCollapse = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, collapsed: !t.collapsed } : t));
  };
  
  const toggleTrackLock = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, locked: !t.locked } : t));
  };
  
  const toggleTrackVisibility = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, visible: !t.visible } : t));
  };
  
  const toggleTrackMute = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };
  
  const toggleTrackSolo = (trackId: string) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t));
  };
  
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const time = (percent * totalDuration * 100) / zoom;
    
    // Snap to beat if enabled
    if (snapEnabled && beatTimestamps.length > 0) {
      const closestBeat = beatTimestamps.reduce((prev, curr) => 
        Math.abs(curr - time) < Math.abs(prev - time) ? curr : prev
      );
      if (Math.abs(closestBeat - time) < 0.5) {
        setPlayheadPosition(closestBeat);
        onPlayheadChange?.(closestBeat);
        return;
      }
    }
    
    setPlayheadPosition(Math.max(0, Math.min(time, totalDuration)));
    onPlayheadChange?.(time);
  };
  
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };
  
  // Stable clip positioning - memoized to prevent layout thrashing
  const getClipWidth = useCallback((duration: number) => {
    return (duration / totalDuration) * 100;
  }, [totalDuration]);
  
  const getClipLeft = useCallback((start: number) => {
    return (start / totalDuration) * 100;
  }, [totalDuration]);
  
  // ─── Empty state ───
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
            Import a video or timeline to see real scene detection, beat sync, and visual effect indicators
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════
  
  return (
    <div className="panel h-full flex flex-col overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse z-20 pointer-events-none" />
      )}
      
      {/* ─── Header ─── */}
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Editing Canvas</span>
          <Badge variant="outline" className="text-[9px] ml-1">
            {clips.length} clips
          </Badge>
          {sceneChanges.length > 0 && (
            <Badge variant="outline" className="text-[9px] bg-success/10 text-success border-success/30">
              {sceneChanges.length} scenes detected
            </Badge>
          )}
          {detectedBPM && (
            <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
              {detectedBPM} BPM
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-mono">
            {formatTimecode(playheadPosition)}
          </Badge>
        </div>
      </div>
      
      {/* ─── Toolbar ─── */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border/40 bg-muted/20 flex-shrink-0">
        {/* Transport controls */}
        <div className="flex items-center gap-0.5 mr-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPlayheadPosition(0)}>
                <SkipBack className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Go to start (Home)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-8 w-8 p-0", isPlaying && "bg-primary/20 text-primary")}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Play/Pause (Space)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPlayheadPosition(Math.min(totalDuration, playheadPosition + 5))}>
                <SkipForward className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward 5s (L)</TooltipContent>
          </Tooltip>
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
        
        <div className="w-px h-5 bg-border/50" />
        
        {/* Pro editing toggles */}
        <div className="flex items-center gap-1 mx-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2 gap-1 text-[10px]", snapEnabled && "bg-primary/20 text-primary")}
                onClick={() => setSnapEnabled(!snapEnabled)}
              >
                <Magnet className="w-3 h-3" />
                Snap
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snap to beats & clips (N)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 px-2 gap-1 text-[10px]", rippleEnabled && "bg-accent/20 text-accent")}
                onClick={() => setRippleEnabled(!rippleEnabled)}
              >
                <GitBranch className="w-3 h-3" />
                Ripple
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ripple edit mode</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="w-px h-5 bg-border/50" />
        
        {/* View toggles */}
        <div className="flex items-center gap-1 mx-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 w-7 p-0", showWaveforms && "bg-green-500/20 text-green-500")}
                onClick={() => setShowWaveforms(!showWaveforms)}
              >
                <AudioLines className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show waveforms</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 w-7 p-0", showMarkers && "bg-purple-500/20 text-purple-500")}
                onClick={() => setShowMarkers(!showMarkers)}
              >
                <Flag className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show markers</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-7 w-7 p-0", showBeatGrid && "bg-primary/20 text-primary")}
                onClick={() => setShowBeatGrid(!showBeatGrid)}
              >
                <Activity className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show beat grid</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="flex-1" />
        
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(prev => Math.max(25, prev - 25))}>
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">{zoom}%</span>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(prev => Math.min(400, prev + 25))}>
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      {/* ─── Timeline ruler with beat grid ─── */}
      <div className="flex items-center h-8 bg-muted/30 border-b border-border/40 flex-shrink-0 relative">
        <div className="w-[140px] flex-shrink-0 px-2 text-[9px] text-muted-foreground">
          {detectedBPM && <span className="font-mono">{detectedBPM} BPM</span>}
        </div>
        <div className="flex-1 relative overflow-hidden" onClick={handleTimelineClick}>
          <div 
            className="flex h-full relative transition-none"
            style={{ width: `${zoom}%`, minWidth: '100%' }}
          >
            {/* Time markers - static, no animation */}
            {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => (
              <div key={i} className="flex-1 relative h-full border-r border-border/30">
                <span className="absolute top-1 left-1 text-[8px] font-mono text-muted-foreground select-none">
                  {formatTimecode(i * 10)}
                </span>
              </div>
            ))}
            
            {/* Beat grid lines - only render if enabled and have data */}
            {showBeatGrid && beatTimestamps.length > 0 && beatTimestamps.slice(0, 100).map((time, i) => (
              <div
                key={`beat-${i}`}
                className={cn(
                  "absolute top-0 h-full w-px pointer-events-none",
                  i % 4 === 0 ? "bg-primary/25" : "bg-primary/10"
                )}
                style={{ left: `${(time / totalDuration) * 100}%` }}
              />
            ))}
            
            {/* Scene markers */}
            {showMarkers && markers.filter(m => m.type === 'scene').map((marker) => (
              <div
                key={marker.id}
                className="absolute top-0 h-full w-0.5 pointer-events-none"
                style={{ 
                  left: `${(marker.time / totalDuration) * 100}%`,
                  backgroundColor: marker.color,
                }}
              />
            ))}
            
            {/* Playhead - stable positioning */}
            <div
              className="absolute top-0 h-full w-0.5 bg-primary z-30 pointer-events-none"
              style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
            >
              <div className="absolute -top-0.5 -left-1.5 w-3 h-3 bg-primary rounded-sm" />
            </div>
          </div>
        </div>
      </div>
      
      {/* ─── Tracks area ─── */}
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
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => toggleTrackCollapse(track.id)}>
                  {track.collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
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
                    className={cn("h-5 w-5 p-0", track.solo && "text-amber-500 bg-amber-500/20")}
                    onClick={() => toggleTrackSolo(track.id)}
                  >
                    <span className="text-[8px] font-bold">S</span>
                  </Button>
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
          
          {/* Timeline content - stable layout */}
          <div ref={timelineRef} className="flex-1 relative overflow-x-auto">
            <div className="relative transition-none" style={{ width: `${zoom}%`, minWidth: '100%' }}>
              {tracks.map((track, trackIndex) => (
                <div
                  key={track.id}
                  className={cn(
                    "relative border-b border-border/30 bg-gradient-to-b",
                    track.type === 'video' && 'from-primary/5 to-transparent',
                    track.type === 'overlay' && 'from-accent/5 to-transparent',
                    track.type === 'audio' && 'from-green-500/5 to-transparent',
                    track.collapsed ? 'h-7' : track.type === 'video' ? 'h-20' : 'h-12',
                    !track.visible && 'opacity-40'
                  )}
                >
                  {/* Clips - stable positioning without transition */}
                  {clips.filter(clip => clip.track === trackIndex).map(clip => {
                    const isSelected = selectedClips.includes(clip.id);
                    const clipWidth = getClipWidth(clip.duration);
                    const clipLeft = getClipLeft(clip.start);
                    
                    return (
                      <div
                        key={clip.id}
                        className={cn(
                          "absolute top-1 bottom-1 rounded-md cursor-pointer group overflow-hidden",
                          "border-2 shadow-sm hover:shadow-md hover:z-10",
                          clip.type === 'video' && 'border-primary/50',
                          clip.type === 'audio' && 'border-green-500/50',
                          clip.type === 'title' && 'border-pink-500/50',
                          clip.type === 'image' && 'border-accent/50',
                          isSelected && 'ring-2 ring-primary ring-offset-1 ring-offset-background border-primary z-20',
                          clip.locked && 'opacity-60 cursor-not-allowed',
                          !clip.visible && 'opacity-30'
                        )}
                        style={{ 
                          left: `${clipLeft}%`, 
                          width: `${clipWidth}%`, 
                          minWidth: '80px',
                        }}
                        onClick={(e) => handleClipClick(clip.id, e)}
                      >
                        {/* Effect type indicator strips - LEFT EDGE */}
                        {clip.effects.length > 0 && !track.collapsed && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 z-20 flex flex-col">
                            {clip.effects.some(e => e.type === 'color') && (
                              <div className="flex-1 bg-amber-500" title="LUT/Color Grade Applied" />
                            )}
                            {clip.effects.some(e => e.type === 'filter') && (
                              <div className="flex-1 bg-cyan-500" title="Effect Applied" />
                            )}
                            {clip.effects.some(e => e.type === 'transition') && (
                              <div className="flex-1 bg-purple-500" title="Transition Applied" />
                            )}
                            {clip.effects.some(e => e.type === 'speed') && (
                              <div className="flex-1 bg-blue-500" title="Speed Effect" />
                            )}
                          </div>
                        )}

                        {/* Video thumbnail background for video clips */}
                        {clip.type === 'video' && videoThumbnail && !track.collapsed && (
                          <div className="absolute inset-0 overflow-hidden">
                            <img
                              src={videoThumbnail}
                              alt=""
                              className="w-full h-full object-cover opacity-50"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/40" />
                          </div>
                        )}
                        
                        {/* Fallback gradient for clips without thumbnail */}
                        {(clip.type !== 'video' || !videoThumbnail || track.collapsed) && (
                          <div className={cn(
                            "absolute inset-0",
                            clip.type === 'video' && 'bg-gradient-to-b from-primary/25 to-primary/15',
                            clip.type === 'audio' && 'bg-gradient-to-b from-green-500/25 to-green-500/15',
                            clip.type === 'title' && 'bg-gradient-to-b from-pink-500/25 to-pink-500/15',
                            clip.type === 'image' && 'bg-gradient-to-b from-accent/25 to-accent/15',
                          )} />
                        )}

                        {/* TOP STRIP - Color Grade/LUT indicator */}
                        {clip.effects.some(e => e.type === 'color') && !track.collapsed && (
                          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-500/90 to-amber-600/90 z-10 flex items-center px-1.5 gap-1">
                            <Palette className="w-2.5 h-2.5 text-white" />
                            <span className="text-[8px] font-bold text-white truncate">
                              {clip.effects.find(e => e.type === 'color')?.name}
                            </span>
                          </div>
                        )}
                        
                        {/* Clip header - positioned below LUT strip if present */}
                        <div className={cn(
                          "relative z-10 flex items-center gap-1 px-1.5 py-0.5 bg-black/30 backdrop-blur-sm",
                          clip.effects.some(e => e.type === 'color') && !track.collapsed && "mt-4"
                        )}>
                          <GripVertical className="w-2.5 h-2.5 text-white/60 opacity-0 group-hover:opacity-100 cursor-grab flex-shrink-0" />
                          <span className="text-[9px] font-semibold text-white truncate flex-1 drop-shadow-sm">{clip.name}</span>
                          {clip.speed !== 1 && (
                            <Badge variant="outline" className="text-[7px] px-1 py-0 h-3 bg-blue-500/80 text-white border-blue-400">{clip.speed}x</Badge>
                          )}
                          {clip.locked && <Lock className="w-2.5 h-2.5 text-warning flex-shrink-0" />}
                          {clip.muted && <VolumeX className="w-2.5 h-2.5 text-destructive flex-shrink-0" />}
                        </div>
                        
                        {/* Effect badges row - more prominent */}
                        {!track.collapsed && clip.effects.length > 0 && (
                          <div className="relative z-10 flex flex-wrap gap-1 px-1.5 py-1">
                            {clip.effects.filter(e => e.type !== 'color').slice(0, 4).map((effect) => {
                              const Icon = effect.icon;
                              return (
                                <Tooltip key={effect.id}>
                                  <TooltipTrigger asChild>
                                    <div className={cn(
                                      "flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[8px] font-bold shadow-sm",
                                      effect.type === 'filter' && 'bg-cyan-500/90 text-white',
                                      effect.type === 'transition' && 'bg-purple-500/90 text-white',
                                      effect.type === 'speed' && 'bg-blue-500/90 text-white',
                                      effect.type === 'audio' && 'bg-green-500/90 text-white',
                                      effect.type === 'graphics' && 'bg-pink-500/90 text-white',
                                    )}>
                                      <Icon className="w-2.5 h-2.5" />
                                      <span className="max-w-[50px] truncate">{effect.name}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <Icon className="w-3.5 h-3.5" />
                                      <span className="capitalize font-medium">{effect.type}:</span>
                                      <span>{effect.name}</span>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                            {clip.effects.filter(e => e.type !== 'color').length > 4 && (
                              <Badge className="text-[8px] px-1 py-0 h-4 bg-white/20 text-white border-0">
                                +{clip.effects.filter(e => e.type !== 'color').length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        {/* Real waveform visualization - stable rendering */}
                        {clip.type === 'audio' && !track.collapsed && showWaveforms && clip.waveform && (
                          <div className="relative z-10 absolute bottom-1 inset-x-1 h-4 flex items-end gap-px overflow-hidden">
                            {clip.waveform.slice(0, 40).map((val, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-green-400/60 rounded-t"
                                style={{ height: `${Math.min(val * 100, 100)}%` }}
                              />
                            ))}
                          </div>
                        )}
                        
                        {/* Resize handles */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-primary/50 transition-colors" />
                        <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-primary/50 transition-colors" />
                        
                        {/* Context menu */}
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
                            <DropdownMenuItem className="text-xs gap-2"><Palette className="w-3.5 h-3.5" />Add Color Grade</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2"><Sparkles className="w-3.5 h-3.5" />Add Effect</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2"><Zap className="w-3.5 h-3.5" />Add Transition</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2"><Clock className="w-3.5 h-3.5" />Speed / Duration</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs gap-2"><Scissors className="w-3.5 h-3.5" />Split Clip</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs gap-2"><Copy className="w-3.5 h-3.5" />Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs gap-2 text-destructive"><Trash2 className="w-3.5 h-3.5" />Delete Clip</DropdownMenuItem>
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
      
      {/* ─── Footer status bar with effect legend ─── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/40 bg-muted/20 text-[10px] text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>{selectedClips.length > 0 ? `${selectedClips.length} selected` : 'No selection'}</span>
          <span className="text-border">|</span>
          <span>{tracks.length} tracks</span>
          <span className="text-border">|</span>
          <span>{clips.length} clips</span>
          {sceneChanges.length > 0 && (
            <>
              <span className="text-border">|</span>
              <span className="text-success">{sceneChanges.length} scenes</span>
            </>
          )}
        </div>
        
        {/* Effect type legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-amber-500" />
            <span>LUT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-cyan-500" />
            <span>Effect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-purple-500" />
            <span>Transition</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm bg-blue-500" />
            <span>Speed</span>
          </div>
          <span className="text-border">|</span>
          <span className="font-mono">{formatTimecode(totalDuration)} total</span>
          {snapEnabled && <Badge variant="outline" className="text-[8px] gap-1"><Magnet className="w-2 h-2" />Snap</Badge>}
          {rippleEnabled && <Badge variant="outline" className="text-[8px] gap-1"><GitBranch className="w-2 h-2" />Ripple</Badge>}
        </div>
      </div>
    </div>
  );
}
