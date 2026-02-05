import { useState, useCallback, useEffect, type RefObject } from 'react';

export type ZoomMode = 'fit' | number;
export type ComparisonMode = 'off' | 'vertical' | 'horizontal' | 'side-by-side' | 'toggle';
export type SafeAreaGuide = 'none' | 'title' | 'action' | 'both';
export type ViewportBg = 'black' | 'gray' | 'checkered';

export interface AspectGuide {
  id: string;
  label: string;
  ratio: number | null;
}

export const ASPECT_RATIO_GUIDES: AspectGuide[] = [
  { id: 'none', label: 'None', ratio: null },
  { id: '16:9', label: '16:9 (HD)', ratio: 16 / 9 },
  { id: '2.39:1', label: '2.39:1 (Anamorphic)', ratio: 2.39 },
  { id: '4:3', label: '4:3 (Classic)', ratio: 4 / 3 },
  { id: '1:1', label: '1:1 (Square)', ratio: 1 },
  { id: '9:16', label: '9:16 (Vertical)', ratio: 9 / 16 },
  { id: '21:9', label: '21:9 (Ultrawide)', ratio: 21 / 9 },
];

const COMPARISON_CYCLE: ComparisonMode[] = ['off', 'vertical', 'horizontal', 'side-by-side', 'toggle'];

export function useViewerSettings(containerRef: RefObject<HTMLElement | null>) {
  const [zoom, setZoom] = useState<ZoomMode>('fit');
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('off');
  const [aspectGuide, setAspectGuide] = useState('none');
  const [safeAreaGuide, setSafeAreaGuide] = useState<SafeAreaGuide>('none');
  const [viewportBg, setViewportBg] = useState<ViewportBg>('black');
  const [showGrid, setShowGrid] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset pan when zoom changes to fit
  useEffect(() => {
    if (zoom === 'fit') setPanOffset({ x: 0, y: 0 });
  }, [zoom]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    }
  }, [containerRef]);

  const cycleComparison = useCallback(() => {
    setComparisonMode(prev => {
      const idx = COMPARISON_CYCLE.indexOf(prev);
      return COMPARISON_CYCLE[(idx + 1) % COMPARISON_CYCLE.length];
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(prev => {
      const current = prev === 'fit' ? 100 : prev;
      return Math.min(400, current + 25);
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const current = prev === 'fit' ? 100 : prev;
      return Math.max(25, current - 25);
    });
  }, []);

  const comparisonModeNumber = (() => {
    switch (comparisonMode) {
      case 'vertical': return 1;
      case 'horizontal': return 2;
      case 'side-by-side': return 3;
      default: return 0;
    }
  })();

  return {
    zoom, setZoom, panOffset, setPanOffset,
    comparisonMode, setComparisonMode, comparisonModeNumber,
    aspectGuide, setAspectGuide,
    safeAreaGuide, setSafeAreaGuide,
    viewportBg, setViewportBg,
    showGrid, setShowGrid,
    showOverlays, setShowOverlays,
    showInfo, setShowInfo,
    isFullscreen, toggleFullscreen,
    cycleComparison, zoomIn, zoomOut,
  };
}
