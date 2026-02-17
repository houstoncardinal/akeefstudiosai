import { useState, useRef, useEffect, useMemo, type RefObject } from 'react';
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
  Grid3X3,
  SplitSquareHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { type VideoFormat } from '@/lib/formats';
import SplitViewDivider from '@/components/studio/SplitViewDivider';
import Histogram from '@/components/studio/Histogram';
import {
  useWebGLRenderer,
  DEFAULT_COLOR_SETTINGS,
  type FullColorSettings,
  type EffectSettings,
} from '@/hooks/useWebGLRenderer';
import { DEFAULT_EFFECT_SETTINGS } from '@/lib/webgl/WebGLRenderer';

const EFFECT_SETTINGS_MAP: Record<string, EffectSettings> = {
  hype_mode: { grainAmount: 0.35, grainSize: 1.6, vignetteAmount: 0.35, vignetteMidpoint: 58, vignetteFeather: 45 },
  cinematic_mode: { grainAmount: 0.12, grainSize: 1.2, vignetteAmount: 0.25, vignetteMidpoint: 64, vignetteFeather: 55 },
  clean_mode: { grainAmount: 0.05, grainSize: 1, vignetteAmount: 0.08, vignetteMidpoint: 70, vignetteFeather: 60 },
  retro_mode: { grainAmount: 0.25, grainSize: 2.1, vignetteAmount: 0.2, vignetteMidpoint: 60, vignetteFeather: 50 },
  dynamic_mode: { grainAmount: 0.18, grainSize: 1.4, vignetteAmount: 0.22, vignetteMidpoint: 62, vignetteFeather: 50 },
};

interface PostProductionOverrides {
  filmGrain?: number;
  vignette?: number;
  globalBrightness?: number;
  globalContrast?: number;
  globalSaturation?: number;
  outputSharpening?: number;
}

interface VideoPreviewPanelProps {
  file: File | null;
  detectedFormat: VideoFormat | null;
  colorGrade: string;
  effectPreset: string;
  isProcessing: boolean;
  colorSettings?: FullColorSettings | null;
  beatTimestamps?: number[];
  sceneChangeTimestamps?: number[];
  videoRef?: RefObject<HTMLVideoElement | null>;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
  onTimeUpdate?: (time: number) => void;
  postProduction?: PostProductionOverrides | null;
}

export default function VideoPreviewPanel({
  file,
  detectedFormat,
  colorGrade,
  effectPreset,
  isProcessing,
  colorSettings,
  beatTimestamps,
  sceneChangeTimestamps,
  videoRef: externalVideoRef,
  canvasRef: externalCanvasRef,
  onTimeUpdate,
  postProduction,
}: VideoPreviewPanelProps) {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef ?? internalCanvasRef;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitPosition, setSplitPosition] = useState(0.5);
  const [histogram, setHistogram] = useState<number[] | null>(null);

  // Merge post-production overrides into color settings
  const webglColor = useMemo<FullColorSettings>(() => {
    const base = colorSettings ?? DEFAULT_COLOR_SETTINGS;
    if (!postProduction) return base;
    return {
      ...base,
      contrast: base.contrast * (postProduction.globalContrast ?? 1),
      saturation: base.saturation * (postProduction.globalSaturation ?? 1),
      highlights: base.highlights + ((postProduction.globalBrightness ?? 1) - 1) * 30,
    };
  }, [colorSettings, postProduction]);

  // Merge post-production effects into WebGL effects
  const webglEffects = useMemo<EffectSettings>(() => {
    const base = EFFECT_SETTINGS_MAP[effectPreset] ?? DEFAULT_EFFECT_SETTINGS;
    if (!postProduction) return base;
    return {
      grainAmount: Math.max(base.grainAmount, postProduction.filmGrain ?? 0),
      grainSize: base.grainSize,
      vignetteAmount: Math.max(base.vignetteAmount, (postProduction.vignette ?? 0) * 0.8),
      vignetteMidpoint: base.vignetteMidpoint,
      vignetteFeather: base.vignetteFeather,
    };
  }, [effectPreset, postProduction]);

  const { captureFrame, isReady } = useWebGLRenderer(
    canvasRef,
    videoRef,
    webglColor,
    webglEffects,
    splitEnabled ? splitPosition : null
  );

  const hasColorGrade = useMemo(() => {
    if (!showOverlays) return false;
    if (colorSettings) return true;
    return colorGrade !== 'none';
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

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };
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
  }, [videoUrl, onTimeUpdate]);

  // Periodically capture a frame for histogram when WebGL is active
  useEffect(() => {
    if (!isReady) return;
    const interval = window.setInterval(() => {
      const frame = captureFrame();
      if (!frame) return;
      const bins = new Array(256).fill(0);
      const data = frame.data;
      for (let i = 0; i < data.length; i += 4) {
        const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        bins[Math.min(255, Math.max(0, Math.round(luma)))] += 1;
      }
      setHistogram(bins);
    }, 700);

    return () => window.clearInterval(interval);
  }, [captureFrame, isReady]);

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
        <div className="flex items-center justify-center h-[160px] sm:h-[200px]">
          <div className="text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center mx-auto mb-3">
              <Film className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/50" />
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {detectedFormat && (
            <Badge variant="outline" className="text-[9px] hidden sm:inline-flex">
              {detectedFormat.name}
            </Badge>
          )}
          <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            <span className="hidden sm:inline">Live</span> Preview
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

        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
        />

        {/* Hidden/visible video element (fallback + texture source) */}
        <video
          ref={videoRef}
          src={videoUrl}
          className={cn(
            'absolute inset-0 w-full h-full object-contain transition-opacity',
            isReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
          playsInline
        />

        {/* Split view divider */}
        {splitEnabled && (
          <SplitViewDivider
            position={splitPosition}
            onChange={setSplitPosition}
            disabled={!isReady}
          />
        )}

        {/* Effect Labels */}
        {showOverlays && hasColorGrade && (
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

        {/* Tap-to-play overlay for mobile */}
        <button
          className="absolute inset-0 z-15 sm:hidden flex items-center justify-center"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {!isPlaying && (
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-6 h-6 text-white ml-0.5" />
            </div>
          )}
        </button>
      </div>

      {/* Controls */}
      <div className="p-2 sm:p-3 space-y-2 bg-card/50">
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
          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-7 sm:w-7 p-0" onClick={skipBackward}>
              <SkipBack className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-9 w-9 sm:h-8 sm:w-8 p-0", isPlaying && "bg-primary/20")}
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5 sm:w-4 sm:h-4" /> : <Play className="w-4.5 h-4.5 sm:w-4 sm:h-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-7 sm:w-7 p-0" onClick={skipForward}>
              <SkipForward className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground ml-1 sm:ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Volume - hidden on small mobile */}
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
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
            <div className="flex items-center gap-0.5 sm:gap-1 border-l border-border/50 pl-1.5 sm:pl-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 sm:h-6 sm:w-6 p-0", showGrid && "bg-primary/20")}
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 sm:h-6 sm:w-6 p-0", showOverlays && "bg-primary/20")}
                onClick={() => setShowOverlays(!showOverlays)}
              >
                {showOverlays ? <Eye className="w-3.5 h-3.5 sm:w-3 sm:h-3" /> : <EyeOff className="w-3.5 h-3.5 sm:w-3 sm:h-3" />}
              </Button>
              {/* Zoom controls - desktop only */}
              <div className="hidden sm:flex items-center gap-1">
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
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={cn("h-7 w-7 sm:h-6 sm:w-6 p-0", splitEnabled && "bg-primary/20")}
                onClick={() => setSplitEnabled((v) => !v)}
                title="Toggle split view"
              >
                <SplitSquareHorizontal className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
              </Button>
              {zoom !== 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 sm:h-6 sm:w-6 p-0"
                  onClick={() => setZoom(100)}
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Histogram - hidden on very small screens */}
        <div className="hidden sm:block">
          <Histogram data={histogram} label="Luma Histogram" height={54} />
        </div>
      </div>
    </div>
  );
}
