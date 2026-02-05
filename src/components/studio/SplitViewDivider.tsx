import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplitViewDividerProps {
  position: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function SplitViewDivider({ position, onChange, disabled }: SplitViewDividerProps) {
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = (e.clientX - rect.left) / rect.width;
      onChange(Math.min(1, Math.max(0, pct)));
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [dragging, onChange]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div
        className={cn(
          'absolute inset-y-0 w-[2px] bg-white/70 shadow-sm pointer-events-auto',
          dragging && 'bg-primary'
        )}
        style={{ left: `${position * 100}%` }}
        onPointerDown={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-2 w-5 h-10 bg-white text-primary rounded-md shadow-lg flex items-center justify-center border border-border"
        >
          <div className="w-[2px] h-5 bg-primary/70" />
        </div>
      </div>
    </div>
  );
}
