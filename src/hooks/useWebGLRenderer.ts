import { useRef, useEffect, useCallback, useState, type RefObject } from 'react';
import {
  WebGLRenderer,
  type FullColorSettings,
  type EffectSettings,
  DEFAULT_COLOR_SETTINGS,
} from '@/lib/webgl/WebGLRenderer';

export type { FullColorSettings, EffectSettings };
export { DEFAULT_COLOR_SETTINGS };

export function useWebGLRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  colorSettings: FullColorSettings | null,
  effects: EffectSettings | null,
  splitPosition: number | null
) {
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize renderer when canvas is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const renderer = new WebGLRenderer(canvas);
      rendererRef.current = renderer;
      renderer.startRenderLoop();
      setIsReady(true);
    } catch (e) {
      console.warn('WebGL renderer initialization failed:', e);
      setIsReady(false);
    }

    return () => {
      rendererRef.current?.dispose();
      rendererRef.current = null;
      setIsReady(false);
    };
  }, [canvasRef]);

  // Set video source when it changes
  useEffect(() => {
    const video = videoRef.current;
    if (rendererRef.current && video) {
      rendererRef.current.setVideoSource(video);
    }
  }, [videoRef, isReady]);

  // Sync color settings to renderer
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.updateColorSettings(colorSettings ?? DEFAULT_COLOR_SETTINGS);
    }
  }, [colorSettings]);

  // Sync effects to renderer
  useEffect(() => {
    if (rendererRef.current && effects) {
      rendererRef.current.updateEffects(effects);
    }
  }, [effects]);

  // Sync split position
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setSplitPosition(splitPosition);
    }
  }, [splitPosition]);

  const captureFrame = useCallback((): ImageData | null => {
    return rendererRef.current?.captureFrame() ?? null;
  }, []);

  return { captureFrame, isReady };
}
