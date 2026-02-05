import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Eye, Loader2 } from 'lucide-react';

interface LUTSettings {
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  shadows: number;
  highlights: number;
}

interface LUTPreviewProps {
  currentFrame: string | null; // Base64 or URL of current video frame
  lutSettings: LUTSettings;
  lutName: string;
  isHovered: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Apply LUT-like color transformations using canvas
function applyLUTToCanvas(
  sourceImage: HTMLImageElement,
  canvas: HTMLCanvasElement,
  settings: LUTSettings
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = sourceImage.width;
  canvas.height = sourceImage.height;

  ctx.drawImage(sourceImage, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Color grading transformations
  const { contrast, saturation, temperature, tint, shadows, highlights } = settings;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Apply contrast
    const contrastFactor = contrast;
    r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;

    // Apply temperature (warm/cool shift)
    const tempShift = temperature / 100;
    r = r + tempShift * 30;
    b = b - tempShift * 30;

    // Apply tint (green/magenta)
    const tintShift = tint / 100;
    g = g + tintShift * 20;

    // Apply saturation
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + saturation * (r - gray);
    g = gray + saturation * (g - gray);
    b = gray + saturation * (b - gray);

    // Apply shadows/highlights
    const luminance = (r + g + b) / 3 / 255;
    if (luminance < 0.5) {
      // Shadows
      const shadowFactor = 1 + shadows / 200;
      r *= shadowFactor;
      g *= shadowFactor;
      b *= shadowFactor;
    } else {
      // Highlights
      const highlightFactor = 1 + highlights / 200;
      r *= highlightFactor;
      g *= highlightFactor;
      b *= highlightFactor;
    }

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
}

export function LUTPreviewThumbnail({
  currentFrame,
  lutSettings,
  lutName,
  isHovered,
  size = 'md',
}: LUTPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    if (!isHovered || !currentFrame || !canvasRef.current || !originalCanvasRef.current) {
      setPreviewReady(false);
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw original (left side)
      if (originalCanvasRef.current) {
        const origCtx = originalCanvasRef.current.getContext('2d');
        if (origCtx) {
          originalCanvasRef.current.width = img.width;
          originalCanvasRef.current.height = img.height;
          origCtx.drawImage(img, 0, 0);
        }
      }
      // Draw LUT-applied (right side)
      if (canvasRef.current) {
        applyLUTToCanvas(img, canvasRef.current, lutSettings);
        setPreviewReady(true);
      }
      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
    };
    img.src = currentFrame;
  }, [isHovered, currentFrame, lutSettings]);

  const sizeClasses = {
    sm: 'w-48 h-14',
    md: 'w-64 h-20',
    lg: 'w-80 h-24',
  };

  if (!isHovered) return null;

  return (
    <div
      className={cn(
        'absolute z-50 rounded-lg overflow-hidden shadow-2xl border border-border/50',
        'bg-black animate-in fade-in-0 zoom-in-95 duration-200',
        sizeClasses[size]
      )}
      style={{
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
      }}
    >
      {isProcessing && !previewReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <Loader2 className="w-4 h-4 animate-spin text-white/70" />
        </div>
      )}
      
      {/* Split view container */}
      <div className={cn(
        'flex w-full h-full transition-opacity',
        previewReady ? 'opacity-100' : 'opacity-0'
      )}>
        {/* Before (Original) */}
        <div className="relative w-1/2 h-full overflow-hidden border-r border-white/20">
          <canvas
            ref={originalCanvasRef}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white/80 bg-black/60 px-1 rounded">
            BEFORE
          </span>
        </div>
        
        {/* After (LUT Applied) */}
        <div className="relative w-1/2 h-full overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-1 right-1 text-[8px] font-bold text-primary bg-black/60 px-1 rounded">
            AFTER
          </span>
        </div>
      </div>
      
      {/* LUT name label */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-1">
        <div className="flex items-center justify-center gap-1">
          <Eye className="w-2.5 h-2.5 text-primary" />
          <span className="text-[9px] font-medium text-white truncate">{lutName}</span>
        </div>
      </div>
    </div>
  );
}

// Hook to capture current video frame
export function useFrameCapture(videoRef: React.RefObject<HTMLVideoElement>) {
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return null;

    const video = videoRef.current;
    if (video.readyState < 2) return null;

    const canvas = document.createElement('canvas');
    // Use smaller size for preview thumbnails
    const scale = 0.25;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7);
  }, [videoRef]);

  const startCapturing = useCallback(() => {
    // Capture immediately
    const frame = captureFrame();
    if (frame) setCurrentFrame(frame);

    // Then capture periodically
    captureIntervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) setCurrentFrame(frame);
    }, 1000); // Update every second
  }, [captureFrame]);

  const stopCapturing = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCapturing();
  }, [stopCapturing]);

  return { currentFrame, captureFrame, startCapturing, stopCapturing };
}

// Context provider for sharing frame across components
import { createContext, useContext, ReactNode } from 'react';

interface FrameCaptureContextType {
  currentFrame: string | null;
  setCurrentFrame: (frame: string | null) => void;
}

const FrameCaptureContext = createContext<FrameCaptureContextType>({
  currentFrame: null,
  setCurrentFrame: () => {},
});

export function FrameCaptureProvider({ children }: { children: ReactNode }) {
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);

  return (
    <FrameCaptureContext.Provider value={{ currentFrame, setCurrentFrame }}>
      {children}
    </FrameCaptureContext.Provider>
  );
}

export function useFrameCaptureContext() {
  return useContext(FrameCaptureContext);
}

// Enhanced LUT card wrapper with preview
interface LUTCardWithPreviewProps {
  children: ReactNode;
  lutSettings: LUTSettings;
  lutName: string;
  className?: string;
}

export function LUTCardWithPreview({
  children,
  lutSettings,
  lutName,
  className,
}: LUTCardWithPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { currentFrame } = useFrameCaptureContext();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 300); // Delay before showing preview
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <LUTPreviewThumbnail
        currentFrame={currentFrame}
        lutSettings={lutSettings}
        lutName={lutName}
        isHovered={isHovered}
        size="md"
      />
    </div>
  );
}