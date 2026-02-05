import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/utils';

interface ColorWheelProps {
  label: string;
  value: { r: number; g: number; b: number };
  onChange: (value: { r: number; g: number; b: number }) => void;
  size?: number;
  disabled?: boolean;
  centerValue?: number;
}

const TAU = Math.PI * 2;

function hslToRgb(h: number, s: number, l: number) {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  h /= 6;
  return { h, s, l };
}

export default function ColorWheel({
  label,
  value,
  onChange,
  size = 96,
  disabled,
  centerValue = 0,
}: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const radius = size / 2;
  const ringWidth = Math.max(8, Math.round(size * 0.14));

  // Map current RGB bias to hue/saturation for the handle position
  const { hueAngle, distance, previewColor } = useMemo(() => {
    const magnitudeScale = centerValue === 1 ? 0.4 : 0.8;
    const normalized = {
      r: 0.5 + (value.r - centerValue) / (magnitudeScale * 2),
      g: 0.5 + (value.g - centerValue) / (magnitudeScale * 2),
      b: 0.5 + (value.b - centerValue) / (magnitudeScale * 2),
    };
    const clamped = {
      r: Math.max(0, Math.min(1, normalized.r)),
      g: Math.max(0, Math.min(1, normalized.g)),
      b: Math.max(0, Math.min(1, normalized.b)),
    };
    const { h, s } = rgbToHsl(clamped.r, clamped.g, clamped.b);
    return {
      hueAngle: h * TAU,
      distance: s,
      previewColor: `rgb(${Math.round(clamped.r * 255)}, ${Math.round(clamped.g * 255)}, ${Math.round(clamped.b * 255)})`,
    };
  }, [centerValue, value.b, value.g, value.r]);

  // Draw the wheel once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = radius;
    const cy = radius;
    ctx.clearRect(0, 0, size, size);

    for (let i = 0; i < 360; i++) {
      const start = (i * TAU) / 360;
      const end = ((i + 1) * TAU) / 360;
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${i}, 100%, 50%)`;
      ctx.lineWidth = ringWidth;
      ctx.arc(cx, cy, radius - ringWidth / 2 - 1, start, end);
      ctx.stroke();
    }

    // Inner fill
    ctx.beginPath();
    ctx.fillStyle = '#0f172a';
    ctx.arc(cx, cy, radius - ringWidth, 0, TAU);
    ctx.fill();
  }, [radius, ringWidth, size]);

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / (rect.width / 2));

      const { r, g, b } = hslToRgb((angle + TAU) % TAU / TAU, dist, 0.5);
      const magnitudeScale = centerValue === 1 ? 0.4 : 0.8;
      const mapped = {
        r: centerValue + (r - 0.5) * 2 * magnitudeScale,
        g: centerValue + (g - 0.5) * 2 * magnitudeScale,
        b: centerValue + (b - 0.5) * 2 * magnitudeScale,
      };
      onChange(mapped);
    },
    [centerValue, disabled, onChange]
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      handlePointer(e.clientX, e.clientY);
    },
    [handlePointer]
  );

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: PointerEvent) => handlePointer(e.clientX, e.clientY);
    const up = () => setIsDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [handlePointer, isDragging]);

  // Handle position
  const handleX = radius + Math.cos(hueAngle) * distance * (radius - ringWidth / 2);
  const handleY = radius + Math.sin(hueAngle) * distance * (radius - ringWidth / 2);

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'relative select-none',
          disabled && 'opacity-60 pointer-events-none'
        )}
        style={{ width: size, height: size }}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-full shadow-inner"
          onPointerDown={onPointerDown}
        />
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer"
          style={{
            background: previewColor,
            left: handleX - 8,
            top: handleY - 8,
          }}
        />
        <div
          className="absolute inset-4 rounded-full border border-white/10 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}
        />
      </div>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        <span className="font-semibold">{label}</span>
        <span className="px-1.5 py-0.5 rounded bg-muted/40 font-mono text-[9px]">
          {value.r.toFixed(2)}, {value.g.toFixed(2)}, {value.b.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
