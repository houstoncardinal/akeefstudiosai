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
  X,
  Info,
  Link2,
  Unlink2,
  Undo2,
  Redo2,
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
import { Separator } from '@/components/ui/separator';
import { type VideoFormat } from '@/lib/formats';
import { type AudioAnalysisResult } from '@/lib/audioAnalysis';
import { type VideoAnalysisResult } from '@/lib/videoAnalysis';
import ClipInspector from './ClipInspector';

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
  linkedClipId?: string; // For audio/video linking
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

interface ExternalClipData {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration: number;
  thumbnail?: string;
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
  // External clips from clip library
  externalClips?: ExternalClipData[];
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

// Undo/Redo history
interface HistoryEntry {
  clips: TimelineClip[];
  label: string;
}

let nextClipId = 1000;
function generateClipId() {
  return `clip-${nextClipId++}`;
}

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
  externalClips,
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
  const [inspectorClipId, setInspectorClipId] = useState<string | null>(null);

  // ─── Editable clip state ───
  const [clips, setClips] = useState<TimelineClip[]>([]);
  const [clipsInitialized, setClipsInitialized] = useState(false);

  // ─── Undo/Redo ───
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback((newClips: TimelineClip[], label: string) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    setHistory(prev => {
      const truncated = prev.slice(0, historyIndex + 1);
      const next = [...truncated, { clips: newClips, label }];
      // Keep max 50 entries
      if (next.length > 50) next.shift();
      return next;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    isUndoRedoRef.current = true;
    const entry = history[historyIndex - 1];
    setClips(entry.clips);
    setHistoryIndex(prev => prev - 1);
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    isUndoRedoRef.current = true;
    const entry = history[historyIndex + 1];
    setClips(entry.clips);
    setHistoryIndex(prev => prev + 1);
  }, [history, historyIndex]);

  // ─── Drag state ───
  const [dragState, setDragState] = useState<{
    type: 'move' | 'trim-left' | 'trim-right';
    clipId: string;
    startX: number;
    originalStart: number;
    originalDuration: number;
    originalInPoint: number;
    timelineWidth: number;
  } | null>(null);

  const [tracks, setTracks] = useState<TimelineTrack[]>([
    { id: 'v1', name: 'Video 1', type: 'video', locked: false, visible: true, muted: false, height: 80, collapsed: false, solo: false },
    { id: 'v2', name: 'Overlay', type: 'overlay', locked: false, visible: true, muted: false, height: 60, collapsed: false, solo: false },
    { id: 'a1', name: 'Audio 1', type: 'audio', locked: false, visible: true, muted: false, height: 50, collapsed: false, solo: false },
    { id: 'a2', name: 'Music', type: 'audio', locked: false, visible: true, muted: false, height: 50, collapsed: true, solo: false },
  ]);

  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Generate static video thumbnail from file (once) ───
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('video/')) {
      setVideoThumbnail(null);
      return;
    }

    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.preload = 'metadata';

    const captureFrame = () => {
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
    return 120;
  }, [audioAnalysis, videoAnalysis]);

  const detectedBPM = audioAnalysis?.bpm || null;
  const beatTimestamps = audioAnalysis?.beatTimestamps || [];
  const energyCurve = audioAnalysis?.energyCurve || [];
  const sceneChanges = videoAnalysis?.sceneChanges || [];

  // ─── Generate markers from real data ───
  const markers: TimelineMarker[] = useMemo(() => {
    const result: TimelineMarker[] = [];

    sceneChanges.forEach((scene, i) => {
      result.push({
        id: `scene-${i}`,
        time: scene.timestamp,
        label: `Scene ${i + 1}`,
        color: 'hsl(280, 100%, 60%)',
        type: 'scene',
      });
    });

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

  // ─── Initialize clips from analysis data (once, then user edits) ───
  useEffect(() => {
    if (!file || clipsInitialized) return;

    const initialClips: TimelineClip[] = [];

    if (sceneChanges.length > 0) {
      sceneChanges.forEach((scene, i) => {
        const nextScene = sceneChanges[i + 1];
        const duration = nextScene
          ? nextScene.timestamp - scene.timestamp
          : totalDuration - scene.timestamp;

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

        if (effectPreset && effectPreset !== 'none') {
          clipEffects.push({
            id: `filter-${i}`,
            type: 'filter',
            name: effectPreset.replace(/_/g, ' '),
            icon: Sparkles,
            color: 'text-cyan-500 bg-cyan-500/20',
          });
        }

        if (transitions.length > 0 && i > 0) {
          clipEffects.push({
            id: `trans-${i}`,
            type: 'transition',
            name: transitions[i % transitions.length]?.replace(/_/g, ' ') || 'Cross Dissolve',
            icon: Zap,
            color: 'text-purple-500 bg-purple-500/20',
          });
        }

        initialClips.push({
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

        initialClips.push({
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

    // Add overlay graphics
    if (graphics.length > 0) {
      graphics.slice(0, 3).forEach((g, i) => {
        initialClips.push({
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

    // Add audio track
    const audioWaveform = energyCurve.length > 0
      ? energyCurve
      : [0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4, 0.6, 0.8, 0.5, 0.7, 0.3, 0.6, 0.8, 0.4, 0.9, 0.5,
         0.4, 0.6, 0.7, 0.5, 0.8, 0.6, 0.4, 0.7, 0.9, 0.5, 0.6, 0.8, 0.4, 0.7, 0.5, 0.9, 0.6, 0.4, 0.8, 0.5];

    initialClips.push({
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

    setClips(initialClips);
    setClipsInitialized(true);
    pushHistory(initialClips, 'Initial timeline');
  }, [file, sceneChanges, totalDuration, colorGrade, effectPreset, transitions, graphics, energyCurve, audioAnalysis, clipsInitialized, pushHistory]);

  // Reset when file changes
  useEffect(() => {
    setClipsInitialized(false);
    setSelectedClips([]);
    setInspectorClipId(null);
    setPlayheadPosition(0);
    setHistory([]);
    setHistoryIndex(-1);
  }, [file]);

  // ─── Add external clips from Clip Library when they arrive ───
  useEffect(() => {
    if (!externalClips || externalClips.length === 0 || !clipsInitialized) return;

    // Find clips not already on the timeline
    const existingIds = new Set(clips.map(c => c.id));
    const newExternalClips = externalClips.filter(ec => !existingIds.has(`ext-${ec.id}`));
    if (newExternalClips.length === 0) return;

    const lastClipEnd = clips.reduce((max, c) => Math.max(max, c.start + c.duration), 0);
    let pos = lastClipEnd + 0.5;

    const addedClips: TimelineClip[] = newExternalClips.map((ec, i) => {
      const clip: TimelineClip = {
        id: `ext-${ec.id}`,
        name: ec.name,
        start: pos,
        duration: ec.duration,
        inPoint: 0,
        outPoint: ec.duration,
        track: ec.type === 'audio' ? 2 : 0,
        type: ec.type === 'image' ? 'image' : ec.type,
        effects: [],
        thumbnailUrl: ec.thumbnail,
        locked: false,
        muted: false,
        visible: true,
        speed: 1,
        volume: 1,
      };
      pos += ec.duration + 0.5;
      return clip;
    });

    const newClips = [...clips, ...addedClips];
    updateClips(newClips, `Added ${addedClips.length} clip(s) from library`);
  }, [externalClips, clipsInitialized]);

  useEffect(() => {
    if (!clipsInitialized || clips.length === 0) return;

    setClips(prev => prev.map(clip => {
      if (clip.type !== 'video') return clip;

      const newEffects = clip.effects.filter(e => e.type !== 'color' && e.type !== 'filter');

      if (colorGrade && colorGrade !== 'none') {
        newEffects.push({
          id: `color-${clip.id}`,
          type: 'color',
          name: colorGrade.replace(/_/g, ' '),
          icon: Palette,
          color: 'text-amber-500 bg-amber-500/20',
        });
      }

      if (effectPreset && effectPreset !== 'none') {
        newEffects.push({
          id: `filter-${clip.id}`,
          type: 'filter',
          name: effectPreset.replace(/_/g, ' '),
          icon: Sparkles,
          color: 'text-cyan-500 bg-cyan-500/20',
        });
      }

      return { ...clip, effects: newEffects };
    }));
  }, [colorGrade, effectPreset, clipsInitialized]);

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

  // ═══════════════════════════════════════════════════════════════════
  // EDITING OPERATIONS
  // ═══════════════════════════════════════════════════════════════════

  const updateClips = useCallback((newClips: TimelineClip[], label: string) => {
    setClips(newClips);
    pushHistory(newClips, label);
  }, [pushHistory]);

  // Split clip at playhead
  const splitClipAtPlayhead = useCallback(() => {
    const clipsAtPlayhead = clips.filter(c =>
      !c.locked && c.start < playheadPosition && c.start + c.duration > playheadPosition
    );

    if (clipsAtPlayhead.length === 0) return;

    const newClips = [...clips];

    clipsAtPlayhead.forEach(clip => {
      const splitPoint = playheadPosition - clip.start;
      const idx = newClips.findIndex(c => c.id === clip.id);
      if (idx === -1) return;

      // Modify original clip to end at split point
      const originalClip = { ...clip, duration: splitPoint, outPoint: clip.inPoint + splitPoint };

      // Create new clip starting at split point
      const newClip: TimelineClip = {
        ...clip,
        id: generateClipId(),
        name: `${clip.name} (split)`,
        start: playheadPosition,
        duration: clip.duration - splitPoint,
        inPoint: clip.inPoint + splitPoint,
        outPoint: clip.outPoint,
      };

      newClips[idx] = originalClip;
      newClips.splice(idx + 1, 0, newClip);
    });

    updateClips(newClips, 'Split clip');
  }, [clips, playheadPosition, updateClips]);

  // Delete selected clips
  const deleteSelectedClips = useCallback(() => {
    if (selectedClips.length === 0) return;

    const lockedSelected = clips.filter(c => selectedClips.includes(c.id) && c.locked);
    if (lockedSelected.length > 0) return; // Don't delete locked clips

    let newClips = clips.filter(c => !selectedClips.includes(c.id));

    // Ripple: close gaps on same track
    if (rippleEnabled) {
      const deletedClips = clips.filter(c => selectedClips.includes(c.id));
      deletedClips.forEach(deleted => {
        const gap = deleted.duration;
        newClips = newClips.map(c => {
          if (c.track === deleted.track && c.start > deleted.start) {
            return { ...c, start: c.start - gap };
          }
          return c;
        });
      });
    }

    updateClips(newClips, 'Delete clips');
    setSelectedClips([]);
    setInspectorClipId(null);
  }, [clips, selectedClips, rippleEnabled, updateClips]);

  // Duplicate selected clips
  const duplicateSelectedClips = useCallback(() => {
    if (selectedClips.length === 0) return;

    const newClips = [...clips];
    const toDuplicate = clips.filter(c => selectedClips.includes(c.id));
    const duplicated: string[] = [];

    toDuplicate.forEach(clip => {
      const newClip: TimelineClip = {
        ...clip,
        id: generateClipId(),
        name: `${clip.name} (copy)`,
        start: clip.start + clip.duration + 0.2,
        effects: clip.effects.map(e => ({ ...e, id: `${e.id}-dup-${Date.now()}` })),
        locked: false,
      };
      newClips.push(newClip);
      duplicated.push(newClip.id);

      // Ripple: shift subsequent clips
      if (rippleEnabled) {
        newClips.forEach(c => {
          if (c.track === clip.track && c.id !== newClip.id && c.start >= newClip.start) {
            c.start += newClip.duration + 0.2;
          }
        });
      }
    });

    updateClips(newClips, 'Duplicate clips');
    setSelectedClips(duplicated);
  }, [clips, selectedClips, rippleEnabled, updateClips]);

  // Delete a single clip by id
  const deleteClip = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.locked) return;

    let newClips = clips.filter(c => c.id !== clipId);

    if (rippleEnabled) {
      newClips = newClips.map(c => {
        if (c.track === clip.track && c.start > clip.start) {
          return { ...c, start: c.start - clip.duration };
        }
        return c;
      });
    }

    updateClips(newClips, 'Delete clip');
    setSelectedClips(prev => prev.filter(id => id !== clipId));
    if (inspectorClipId === clipId) setInspectorClipId(null);
  }, [clips, rippleEnabled, updateClips, inspectorClipId]);

  // Duplicate a single clip
  const duplicateClip = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const newClip: TimelineClip = {
      ...clip,
      id: generateClipId(),
      name: `${clip.name} (copy)`,
      start: clip.start + clip.duration + 0.2,
      effects: clip.effects.map(e => ({ ...e, id: `${e.id}-dup-${Date.now()}` })),
      locked: false,
    };

    const newClips = [...clips, newClip];
    updateClips(newClips, 'Duplicate clip');
    setSelectedClips([newClip.id]);
  }, [clips, updateClips]);

  // Toggle lock on a clip
  const toggleClipLock = useCallback((clipId: string) => {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, locked: !c.locked } : c));
  }, []);

  // Toggle visibility on a clip
  const toggleClipVisibility = useCallback((clipId: string) => {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, visible: !c.visible } : c));
  }, []);

  // Change clip speed
  const changeClipSpeed = useCallback((clipId: string, speed: number) => {
    setClips(prev => prev.map(c => {
      if (c.id !== clipId) return c;
      // Adjust duration proportionally
      const ratio = c.speed / speed;
      return { ...c, speed, duration: c.duration * ratio, outPoint: c.outPoint * ratio };
    }));
  }, []);

  // Change clip volume
  const changeClipVolume = useCallback((clipId: string, volume: number) => {
    setClips(prev => prev.map(c => c.id === clipId ? { ...c, volume } : c));
  }, []);

  // Remove effect from clip
  const removeClipEffect = useCallback((clipId: string, effectId: string) => {
    const newClips = clips.map(c => {
      if (c.id !== clipId) return c;
      return { ...c, effects: c.effects.filter(e => e.id !== effectId) };
    });
    updateClips(newClips, 'Remove effect');
  }, [clips, updateClips]);

  // Unlink audio from video clip (creates separate audio clip on audio track)
  const unlinkAudio = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.type !== 'video') return;

    const audioClipId = generateClipId();
    const audioClip: TimelineClip = {
      id: audioClipId,
      name: `${clip.name} (Audio)`,
      start: clip.start,
      duration: clip.duration,
      inPoint: clip.inPoint,
      outPoint: clip.outPoint,
      track: 2, // Audio 1 track
      type: 'audio',
      effects: [],
      locked: false,
      muted: false,
      visible: true,
      speed: clip.speed,
      volume: clip.volume,
      waveform: [0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.7, 0.4],
      linkedClipId: undefined, // Unlinked
    };

    // Mute the video clip's audio
    const newClips = clips.map(c => {
      if (c.id === clipId) return { ...c, muted: true, linkedClipId: undefined };
      return c;
    });
    newClips.push(audioClip);
    updateClips(newClips, 'Unlink audio');
  }, [clips, updateClips]);

  // Split a specific clip at playhead (from context menu)
  const splitClip = useCallback((clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.locked) return;

    // If playhead isn't inside this clip, place it in the middle
    let splitTime = playheadPosition;
    if (splitTime <= clip.start || splitTime >= clip.start + clip.duration) {
      splitTime = clip.start + clip.duration / 2;
    }

    const splitPoint = splitTime - clip.start;
    const newClips = [...clips];
    const idx = newClips.findIndex(c => c.id === clipId);

    const originalClip = { ...clip, duration: splitPoint, outPoint: clip.inPoint + splitPoint };
    const newClip: TimelineClip = {
      ...clip,
      id: generateClipId(),
      name: `${clip.name} (split)`,
      start: splitTime,
      duration: clip.duration - splitPoint,
      inPoint: clip.inPoint + splitPoint,
    };

    newClips[idx] = originalClip;
    newClips.splice(idx + 1, 0, newClip);
    updateClips(newClips, 'Split clip');
  }, [clips, playheadPosition, updateClips]);

  // ═══════════════════════════════════════════════════════════════════
  // DRAG HANDLERS (Trim + Move)
  // ═══════════════════════════════════════════════════════════════════

  const handleTrimLeftStart = useCallback((clipId: string, e: React.PointerEvent) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.locked) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const timelineWidth = timelineRef.current?.getBoundingClientRect().width || 1;
    setDragState({
      type: 'trim-left',
      clipId,
      startX: e.clientX,
      originalStart: clip.start,
      originalDuration: clip.duration,
      originalInPoint: clip.inPoint,
      timelineWidth: timelineWidth * (zoom / 100),
    });
  }, [clips, zoom]);

  const handleTrimRightStart = useCallback((clipId: string, e: React.PointerEvent) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.locked) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const timelineWidth = timelineRef.current?.getBoundingClientRect().width || 1;
    setDragState({
      type: 'trim-right',
      clipId,
      startX: e.clientX,
      originalStart: clip.start,
      originalDuration: clip.duration,
      originalInPoint: clip.inPoint,
      timelineWidth: timelineWidth * (zoom / 100),
    });
  }, [clips, zoom]);

  const handleMoveStart = useCallback((clipId: string, e: React.PointerEvent) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || clip.locked) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const timelineWidth = timelineRef.current?.getBoundingClientRect().width || 1;
    setDragState({
      type: 'move',
      clipId,
      startX: e.clientX,
      originalStart: clip.start,
      originalDuration: clip.duration,
      originalInPoint: clip.inPoint,
      timelineWidth: timelineWidth * (zoom / 100),
    });
  }, [clips, zoom]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaTime = (deltaX / dragState.timelineWidth) * totalDuration;

    setClips(prev => prev.map(c => {
      if (c.id !== dragState.clipId) return c;

      if (dragState.type === 'move') {
        let newStart = Math.max(0, dragState.originalStart + deltaTime);

        // Snap to other clip edges and beats
        if (snapEnabled) {
          const snapThreshold = totalDuration * 0.005;
          const clipEnd = newStart + c.duration;

          // Snap to other clips
          for (const other of prev) {
            if (other.id === c.id || other.track !== c.track) continue;
            const otherEnd = other.start + other.duration;
            // Snap start to other end
            if (Math.abs(newStart - otherEnd) < snapThreshold) {
              newStart = otherEnd;
              break;
            }
            // Snap end to other start
            if (Math.abs(clipEnd - other.start) < snapThreshold) {
              newStart = other.start - c.duration;
              break;
            }
          }

          // Snap to playhead
          if (Math.abs(newStart - playheadPosition) < snapThreshold) {
            newStart = playheadPosition;
          }

          // Snap to beats
          for (const beat of beatTimestamps) {
            if (Math.abs(newStart - beat) < snapThreshold) {
              newStart = beat;
              break;
            }
          }
        }

        return { ...c, start: Math.max(0, newStart) };
      }

      if (dragState.type === 'trim-left') {
        const newStart = Math.max(0, dragState.originalStart + deltaTime);
        const maxStart = dragState.originalStart + dragState.originalDuration - 0.5;
        const clampedStart = Math.min(newStart, maxStart);
        const deltaStart = clampedStart - dragState.originalStart;

        return {
          ...c,
          start: clampedStart,
          duration: dragState.originalDuration - deltaStart,
          inPoint: Math.max(0, dragState.originalInPoint + deltaStart),
        };
      }

      if (dragState.type === 'trim-right') {
        const newDuration = Math.max(0.5, dragState.originalDuration + deltaTime);
        return {
          ...c,
          duration: newDuration,
          outPoint: c.inPoint + newDuration,
        };
      }

      return c;
    }));
  }, [dragState, totalDuration, snapEnabled, playheadPosition, beatTimestamps]);

  const handlePointerUp = useCallback(() => {
    if (!dragState) return;
    // Push to history after drag completes
    pushHistory(clips, `${dragState.type === 'move' ? 'Move' : 'Trim'} clip`);
    setDragState(null);
  }, [dragState, clips, pushHistory]);

  // ─── Handlers ───
  const handleClipClick = useCallback((clipId: string, e: React.MouseEvent) => {
    if (dragState) return; // Don't select during drag

    if (e.shiftKey) {
      setSelectedClips(prev =>
        prev.includes(clipId) ? prev.filter(id => id !== clipId) : [...prev, clipId]
      );
    } else {
      setSelectedClips([clipId]);
    }
    onClipSelect?.(clipId);
  }, [onClipSelect, dragState]);

  const handleClipDoubleClick = useCallback((clipId: string) => {
    setInspectorClipId(clipId);
  }, []);

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

  const getClipWidth = useCallback((duration: number) => {
    return (duration / totalDuration) * 100;
  }, [totalDuration]);

  const getClipLeft = useCallback((start: number) => {
    return (start / totalDuration) * 100;
  }, [totalDuration]);

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!file) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            splitClipAtPlayhead();
          }
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelectedClips();
          break;
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            duplicateSelectedClips();
          }
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setSelectedClips(clips.map(c => c.id));
          }
          break;
        case 'Escape':
          setSelectedClips([]);
          setInspectorClipId(null);
          break;
        case 'n':
        case 'N':
          if (!e.ctrlKey && !e.metaKey) {
            setSnapEnabled(prev => !prev);
          }
          break;
        case 'Home':
          e.preventDefault();
          setPlayheadPosition(0);
          onPlayheadChange?.(0);
          break;
        case 'End':
          e.preventDefault();
          setPlayheadPosition(totalDuration);
          onPlayheadChange?.(totalDuration);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPlayheadPosition(prev => {
            const step = e.shiftKey ? 1 : 0.1;
            const next = Math.max(0, prev - step);
            onPlayheadChange?.(next);
            return next;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPlayheadPosition(prev => {
            const step = e.shiftKey ? 1 : 0.1;
            const next = Math.min(totalDuration, prev + step);
            onPlayheadChange?.(next);
            return next;
          });
          break;
        case 'l':
        case 'L':
          if (!e.ctrlKey && !e.metaKey) {
            setPlayheadPosition(prev => Math.min(totalDuration, prev + 5));
          }
          break;
        case 'j':
        case 'J':
          if (!e.ctrlKey && !e.metaKey) {
            setPlayheadPosition(prev => Math.max(0, prev - 5));
          }
          break;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [file, splitClipAtPlayhead, deleteSelectedClips, duplicateSelectedClips, undo, redo, clips, totalDuration, onPlayheadChange]);

  // ─── Inspector clip data ───
  const inspectorClip = useMemo(() => {
    if (!inspectorClipId) return null;
    return clips.find(c => c.id === inspectorClipId) || null;
  }, [inspectorClipId, clips]);

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
    <div
      ref={containerRef}
      tabIndex={0}
      className="panel h-full flex flex-col overflow-hidden outline-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
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
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setPlayheadPosition(0); onPlayheadChange?.(0); }}>
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
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { const t = Math.min(totalDuration, playheadPosition + 5); setPlayheadPosition(t); onPlayheadChange?.(t); }}>
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
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={splitClipAtPlayhead}>
                <Scissors className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Split at playhead (S)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={duplicateSelectedClips} disabled={selectedClips.length === 0}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate (Ctrl+D)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={deleteSelectedClips} disabled={selectedClips.length === 0}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete (Del)</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-5 bg-border/50" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 mx-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
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
            {Array.from({ length: Math.ceil(totalDuration / 10) + 1 }).map((_, i) => (
              <div key={i} className="flex-1 relative h-full border-r border-border/30">
                <span className="absolute top-1 left-1 text-[8px] font-mono text-muted-foreground select-none">
                  {formatTimecode(i * 10)}
                </span>
              </div>
            ))}

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

            <div
              className="absolute top-0 h-full w-0.5 bg-primary z-30 pointer-events-none"
              style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
            >
              <div className="absolute -top-0.5 -left-1.5 w-3 h-3 bg-primary rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main content: Tracks + Inspector ─── */}
      <div className="flex flex-1 overflow-hidden">
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

            {/* Timeline content */}
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
                    {clips.filter(clip => clip.track === trackIndex).map(clip => {
                      const isSelected = selectedClips.includes(clip.id);
                      const clipWidth = getClipWidth(clip.duration);
                      const clipLeft = getClipLeft(clip.start);
                      const isDragging = dragState?.clipId === clip.id;

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
                            isDragging && 'opacity-80 z-30 shadow-lg',
                            clip.locked && 'opacity-60 cursor-not-allowed',
                            !clip.visible && 'opacity-30'
                          )}
                          style={{
                            left: `${clipLeft}%`,
                            width: `${clipWidth}%`,
                            minWidth: '80px',
                          }}
                          onClick={(e) => handleClipClick(clip.id, e)}
                          onDoubleClick={() => handleClipDoubleClick(clip.id)}
                          onPointerDown={(e) => {
                            // Only start move if not clicking on resize handles or context menu
                            const target = e.target as HTMLElement;
                            if (target.dataset.handle || target.closest('[data-handle]')) return;
                            if (target.closest('[role="menu"]') || target.closest('button')) return;
                            handleMoveStart(clip.id, e);
                          }}
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

                          {/* Video thumbnail background */}
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

                          {/* Fallback gradient */}
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

                          {/* Clip header */}
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

                          {/* Effect badges row */}
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

                          {/* Waveform */}
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

                          {/* Trim handle LEFT */}
                          <div
                            data-handle="trim-left"
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-white/30 transition-colors z-30 flex items-center justify-center"
                            onPointerDown={(e) => handleTrimLeftStart(clip.id, e)}
                          >
                            <div className="w-0.5 h-4 bg-white/50 rounded-full opacity-0 group-hover:opacity-100" />
                          </div>

                          {/* Trim handle RIGHT */}
                          <div
                            data-handle="trim-right"
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-white/30 transition-colors z-30 flex items-center justify-center"
                            onPointerDown={(e) => handleTrimRightStart(clip.id, e)}
                          >
                            <div className="w-0.5 h-4 bg-white/50 rounded-full opacity-0 group-hover:opacity-100" />
                          </div>

                          {/* Context menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-0.5 right-0.5 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => setInspectorClipId(clip.id)}>
                                <Info className="w-3.5 h-3.5" />Inspect / Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => splitClip(clip.id)}>
                                <Scissors className="w-3.5 h-3.5" />Split at Playhead
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => duplicateClip(clip.id)}>
                                <Copy className="w-3.5 h-3.5" />Duplicate
                              </DropdownMenuItem>
                              {clip.type === 'video' && (
                                <DropdownMenuItem className="text-xs gap-2" onClick={() => unlinkAudio(clip.id)}>
                                  <Unlink2 className="w-3.5 h-3.5" />Unlink Audio
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => toggleClipLock(clip.id)}>
                                {clip.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                {clip.locked ? 'Unlock Clip' : 'Lock Clip'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs gap-2" onClick={() => toggleClipVisibility(clip.id)}>
                                {clip.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {clip.visible ? 'Hide Clip' : 'Show Clip'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => deleteClip(clip.id)}>
                                <Trash2 className="w-3.5 h-3.5" />Delete Clip
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

        {/* ─── Clip Inspector (slide-in panel) ─── */}
        {inspectorClip && (
          <ClipInspector
            clip={{
              id: inspectorClip.id,
              name: inspectorClip.name,
              type: inspectorClip.type,
              start: inspectorClip.start,
              duration: inspectorClip.duration,
              effects: inspectorClip.effects.map(e => ({ id: e.id, type: e.type, name: e.name })),
              speed: inspectorClip.speed,
              volume: inspectorClip.volume,
              locked: inspectorClip.locked,
              visible: inspectorClip.visible,
            }}
            onClose={() => setInspectorClipId(null)}
            onSpeedChange={(speed) => changeClipSpeed(inspectorClip.id, speed)}
            onVolumeChange={(volume) => changeClipVolume(inspectorClip.id, volume)}
            onToggleLock={() => toggleClipLock(inspectorClip.id)}
            onToggleVisibility={() => toggleClipVisibility(inspectorClip.id)}
            onDelete={() => deleteClip(inspectorClip.id)}
            onDuplicate={() => duplicateClip(inspectorClip.id)}
            onRemoveEffect={(effectId) => removeClipEffect(inspectorClip.id, effectId)}
          />
        )}
      </div>

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
