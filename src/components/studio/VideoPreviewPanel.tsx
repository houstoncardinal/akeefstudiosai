import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Layers,
  Palette,
  Sparkles,
  Film,
  Settings2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid3X3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { type VideoFormat } from '@/lib/formats';

interface VideoPreviewPanelProps {
  file: File | null;
  detectedFormat: VideoFormat | null;
  colorGrade: string;
  effectPreset: string;
  isProcessing: boolean;
}

interface EffectOverlay {
  id: string;
  name: string;
  enabled: boolean;
  cssFilter: string;
}

export default function VideoPreviewPanel({ 
  file, 
  detectedFormat,
  colorGrade,
  effectPreset,
  isProcessing 
}: VideoPreviewPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Effect overlays based on current settings
  const effectOverlays = useMemo<EffectOverlay[]>(() => {
    const overlays: EffectOverlay[] = [];

    // Color grade CSS filters
    const gradeFilters: Record<string, string> = {
      'teal_orange': 'sepia(0.2) saturate(1.3) hue-rotate(-10deg) contrast(1.1)',
      'vintage_film': 'sepia(0.4) saturate(0.8) contrast(1.1) brightness(0.95)',
      'moody_desat': 'saturate(0.5) contrast(1.3) brightness(0.9)',
      'vibrant_pop': 'saturate(1.5) contrast(1.2) brightness(1.05)',
      'neon_nights': 'saturate(1.4) contrast(1.3) hue-rotate(15deg) brightness(0.95)',
      'golden_hour': 'sepia(0.3) saturate(1.2) brightness(1.1) contrast(0.95)',
      'bw_classic': 'grayscale(1) contrast(1.3)',
      'thriller_cold': 'saturate(0.7) hue-rotate(-20deg) contrast(1.2) brightness(0.9)',
    };

    if (colorGrade && gradeFilters[colorGrade]) {
      overlays.push({
        id: 'color_grade',
        name: 'Color Grade',
        enabled: true,
        cssFilter: gradeFilters[colorGrade],
      });
    }

    // Effect preset overlays
    if (effectPreset === 'hype_mode') {
      overlays.push({
        id: 'vignette',
        name: 'Vignette',
        enabled: true,
        cssFilter: '',
      });
    }

    return overlays;
  }, [colorGrade, effectPreset]);

  // Combined filter string
  const combinedFilter = useMemo(() => {
    if (!showOverlays) return 'none';
    return effectOverlays
      .filter(o => o.enabled && o.cssFilter)
      .map(o => o.cssFilter)
      .join(' ') || 'none';
  }, [effectOverlays, showOverlays]);

  // Create video URL from file
  useEffect(() => {
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setVideoUrl(null);
    }
  }, [file]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const vol = value[0];
    video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 5);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 5);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // No video loaded state
  if (!videoUrl) {
    return (
      <div className="panel h-full relative overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Video Preview</span>
          </div>
        </div>
        <div className="flex items-center justify-center h-[200px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center mx-auto mb-3">
              <Film className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No video loaded</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Import a video file to preview effects in real-time
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full relative overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-pulse z-20 pointer-events-none" />
      )}

      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Video Preview</span>
        </div>
        <div className="flex items-center gap-2">
          {detectedFormat && (
            <Badge variant="outline" className="text-[9px]">
              {detectedFormat.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            Live Preview
          </Badge>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative bg-black/90 aspect-video overflow-hidden">
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}

        {/* Letterbox Overlay */}
        {effectPreset === 'cinematic_mode' && (
          <>
            <div className="absolute top-0 left-0 right-0 h-[12%] bg-black z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-black z-10" />
          </>
        )}

        {/* Vignette Overlay */}
        {showOverlays && effectPreset === 'hype_mode' && (
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)'
            }}
          />
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          style={{ 
            filter: combinedFilter,
            transform: `scale(${zoom / 100})`
          }}
          playsInline
        />

        {/* Effect Labels */}
        {showOverlays && effectOverlays.length > 0 && (
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            {effectOverlays.filter(o => o.enabled).map((overlay) => (
              <Badge 
                key={overlay.id}
                variant="secondary" 
                className="text-[8px] bg-black/60 text-white border-0 backdrop-blur-sm"
              >
                <Palette className="w-2.5 h-2.5 mr-1" />
                {overlay.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Zoom Level */}
        {zoom !== 100 && (
          <div className="absolute top-2 right-2 z-20">
            <Badge variant="secondary" className="text-[8px] bg-black/60 text-white border-0 backdrop-blur-sm">
              {zoom}%
            </Badge>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-3 space-y-2 bg-card/50">
        {/* Progress Bar */}
        <div className="relative">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={skipBackward}>
              <SkipBack className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 w-8 p-0", isPlaying && "bg-primary/20")}
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={skipForward}>
              <SkipForward className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-16"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-1 border-l border-border/50 pl-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-6 w-6 p-0", showGrid && "bg-primary/20")}
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn("h-6 w-6 p-0", showOverlays && "bg-primary/20")}
                onClick={() => setShowOverlays(!showOverlays)}
              >
                {showOverlays ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setZoom(prev => Math.min(200, prev + 25))}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setZoom(prev => Math.max(50, prev - 25))}
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              {zoom !== 100 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setZoom(100)}
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}