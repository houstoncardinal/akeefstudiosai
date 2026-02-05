import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { type CinematicLUT } from '@/lib/presets';

interface Options {
  width?: number;
  height?: number;
  enabled?: boolean;
  intervalMs?: number;
}

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 180;

function buildFilter(settings: CinematicLUT['settings']) {
  const parts: string[] = [];
  // Contrast & saturation
  parts.push(`contrast(${settings.contrast})`);
  parts.push(`saturate(${settings.saturation})`);

  // Temperature/tint approximations
  if (settings.temperature > 0) {
    parts.push(`sepia(${Math.min(settings.temperature / 80, 0.45)})`);
  } else if (settings.temperature < 0) {
    parts.push(`hue-rotate(${settings.temperature * 0.6}deg)`);
  }

  if (settings.tint !== 0) {
    parts.push(`hue-rotate(${settings.tint * 0.4}deg)`);
  }

  // Highlights/shadows as brightness bias
  const brightness = 1 + settings.highlights / 120 - settings.shadows / 160;
  parts.push(`brightness(${brightness})`);

  return parts.join(' ');
}

/**
 * Generates live thumbnails for LUT cards from the current video frame using a light 2D canvas pass.
 */
export function useLiveLUTThumbnails(
  videoRef: RefObject<HTMLVideoElement | null>,
  luts: CinematicLUT[],
  options?: Options
) {
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lutIndexRef = useRef(0);

  const { width, height, enabled, intervalMs } = useMemo(
    () => ({
      width: options?.width ?? DEFAULT_WIDTH,
      height: options?.height ?? DEFAULT_HEIGHT,
      enabled: options?.enabled ?? true,
      intervalMs: options?.intervalMs ?? 900,
    }),
    [options]
  );

  useEffect(() => {
    if (!enabled || luts.length === 0) return;
    const video = videoRef.current;
    if (!video) return;

    const canvas = canvasRef.current ?? document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timerId: number | null = null;

    const tick = () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || videoRef.current.paused) {
        timerId = window.setTimeout(tick, intervalMs);
        return;
      }

      const lut = luts[lutIndexRef.current % luts.length];
      lutIndexRef.current += 1;

      ctx.save();
      ctx.filter = buildFilter(lut.settings);
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      ctx.restore();

      const url = canvas.toDataURL('image/jpeg', 0.65);
      setThumbnails((prev) => {
        const next = new Map(prev);
        next.set(lut.id, url);
        return next;
      });

      timerId = window.setTimeout(tick, intervalMs);
    };

    timerId = window.setTimeout(tick, intervalMs);

    return () => {
      if (timerId) window.clearTimeout(timerId);
    };
  }, [enabled, height, intervalMs, luts, videoRef, width]);

  return thumbnails;
}
