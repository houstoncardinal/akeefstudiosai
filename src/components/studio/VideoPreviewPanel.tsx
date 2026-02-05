import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Palette,
  Sparkles,
  Film,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Grid3X3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { type VideoFormat } from '@/lib/formats';
import { type ColorSettings } from '@/components/studio/ColorPanel';

interface VideoPreviewPanelProps {
  file: File | null;
  detectedFormat: VideoFormat | null;
  colorGrade: string;
  effectPreset: string;
  isProcessing: boolean;
  colorSettings?: ColorSettings | null;
  beatTimestamps?: number[];
  sceneChangeTimestamps?: number[];
}

export default function VideoPreviewPanel({
  file,
  detectedFormat,
  colorGrade,
  effectPreset,
  isProcessing,
  colorSettings,
  beatTimestamps,
  sceneChangeTimestamps
}: VideoPreviewPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Build CSS filter from custom color settings or fall back to LUT-based preset
  const combinedFilter = useMemo(() => {
    if (!showOverlays) return 'none';

    // If we have custom color settings, build filter dynamically
    if (colorSettings) {
      const parts: string[] = [];
      if (colorSettings.contrast !== 1) parts.push(`contrast(${colorSettings.contrast})`);
      if (colorSettings.saturation !== 1) parts.push(`saturate(${colorSettings.saturation})`);
      // Temperature: positive = warm (sepia shift), negative = cool (hue-rotate blue)
      if (colorSettings.temperature > 0) {
        parts.push(`sepia(${Math.min(colorSettings.temperature / 100, 0.5)})`);
      } else if (colorSettings.temperature < 0) {
        parts.push(`hue-rotate(${Math.max(colorSettings.temperature * 0.4, -20)}deg)`);
      }
      // Shadows/highlights mapped to brightness shift
      const brightnessAdjust = 1 + (colorSettings.highlights / 200) - (colorSettings.shadows / 400);
      if (Math.abs(brightnessAdjust - 1) > 0.01) parts.push(`brightness(${brightnessAdjust.toFixed(3)})`);
      return parts.length > 0 ? parts.join(' ') : 'none';
    }

    // Fall back to LUT-based preset filters
    const gradeFilters: Record<string, string> = {
      'teal-orange': 'sepia(0.2) saturate(1.3) hue-rotate(-10deg) contrast(1.1)',
      'vintage-film': 'sepia(0.4) saturate(0.8) contrast(1.1) brightness(0.95)',
      'moody-desat': 'saturate(0.5) contrast(1.3) brightness(0.9)',
      'vibrant-pop': 'saturate(1.5) contrast(1.2) brightness(1.05)',
      'neon-nights': 'saturate(1.4) contrast(1.3) hue-rotate(15deg) brightness(0.95)',
      'golden-hour': 'sepia(0.3) saturate(1.2) brightness(1.1) contrast(0.95)',
      'bw-classic': 'grayscale(1) contrast(1.3)',
      'thriller-cold': 'saturate(0.7) hue-rotate(-20deg) contrast(1.2) brightness(0.9)',
      'clean-natural': 'contrast(1.05) saturate(1.05)',
      'blockbuster': 'contrast(1.2) saturate(1.1) brightness(0.95)',
      'kodak-gold': 'sepia(0.15) saturate(1.3) contrast(1.05) brightness(1.02)',
      'fuji-velvia': 'saturate(1.4) contrast(1.15)',
      'scifi-green': 'hue-rotate(30deg) saturate(0.8) contrast(1.2)',
      'romance-soft': 'saturate(0.9) brightness(1.08) contrast(0.92)',
    };

    return gradeFilters[colorGrade] || 'none';
  }, [colorGrade, colorSettings, showOverlays]);

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
        {showOverlays && combinedFilter !== 'none' && (
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            <Badge
              variant="secondary"
              className="text-[8px] bg-black/60 text-white border-0 backdrop-blur-sm"
            >
              <Palette className="w-2.5 h-2.5 mr-1" />
              {colorSettings ? 'Custom Grade' : 'Color Grade'}
            </Badge>
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
        {/* Progress Bar with markers */}
        <div className="relative">
          {/* Beat markers */}
          {duration > 0 && beatTimestamps && beatTimestamps.length > 0 && (
            <div className="absolute inset-x-0 top-0 bottom-0 z-10 pointer-events-none">
              {beatTimestamps
                .filter(t => t <= duration)
                .map((t, i) => (
                  <div
                    key={`beat-${i}`}
                    className="absolute top-0 w-[2px] h-full bg-primary/40 rounded-full"
                    style={{ left: `${(t / duration) * 100}%` }}
                  />
                ))}
            </div>
          )}
          {/* Scene change markers */}
          {duration > 0 && sceneChangeTimestamps && sceneChangeTimestamps.length > 0 && (
            <div className="absolute inset-x-0 top-0 bottom-0 z-10 pointer-events-none">
              {sceneChangeTimestamps
                .filter(t => t <= duration)
                .map((t, i) => (
                  <div
                    key={`scene-${i}`}
                    className="absolute top-0 w-[3px] h-full bg-accent/60 rounded-full"
                    style={{ left: `${(t / duration) * 100}%` }}
                  />
                ))}
            </div>
          )}
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        {/* Marker legend */}
        {duration > 0 && ((beatTimestamps && beatTimestamps.length > 0) || (sceneChangeTimestamps && sceneChangeTimestamps.length > 0)) && (
          <div className="flex items-center gap-3">
            {beatTimestamps && beatTimestamps.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/40" />
                <span className="text-[8px] text-muted-foreground">Beats ({beatTimestamps.length})</span>
              </div>
            )}
            {sceneChangeTimestamps && sceneChangeTimestamps.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-accent/60" />
                <span className="text-[8px] text-muted-foreground">Scenes ({sceneChangeTimestamps.length})</span>
              </div>
            )}
          </div>
        )}

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
