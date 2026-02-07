import { useState, useCallback, useRef } from 'react';

export interface RenderProgress {
  stage: 'preparing' | 'rendering' | 'encoding' | 'complete' | 'failed';
  progress: number;
  message: string;
}

export interface RenderOptions {
  format: 'mp4' | 'webm';
  width: number;
  height: number;
  frameRate: number;
  videoBitrate: number;
  audioBitrate: number;
}

const DEFAULT_OPTIONS: RenderOptions = {
  format: 'webm', // WebM is best browser-native supported format
  width: 1920,
  height: 1080,
  frameRate: 30,
  videoBitrate: 8_000_000, // 8 Mbps
  audioBitrate: 128_000, // 128 kbps
};

/**
 * Hook for rendering video from a source video element with effects applied.
 * Uses MediaRecorder API for browser-native video encoding.
 */
export function useVideoRenderer() {
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const abortRef = useRef(false);

  /**
   * Render a video to a downloadable blob.
   * Captures frames from a canvas where effects have been applied.
   */
  const renderVideo = useCallback(async (
    sourceVideo: HTMLVideoElement,
    effectsCanvas: HTMLCanvasElement | null,
    options: Partial<RenderOptions> = {}
  ): Promise<Blob | null> => {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    abortRef.current = false;
    setIsRendering(true);
    setRenderProgress({ stage: 'preparing', progress: 0, message: 'Preparing video...' });

    try {
      // Check browser support for MediaRecorder
      if (!window.MediaRecorder) {
        throw new Error('Your browser does not support video rendering. Please use Chrome, Firefox, or Edge.');
      }

      // Determine the best supported codec
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error('Your browser does not support video encoding. Please use Chrome or Firefox.');
      }

      // Create rendering canvas
      const canvas = document.createElement('canvas');
      canvas.width = opts.width;
      canvas.height = opts.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to create rendering context');

      // Capture stream from canvas
      const stream = canvas.captureStream(opts.frameRate);

      // Add audio track from source video if available
      // Use type assertion for captureStream as it's not in all TypeScript libs
      const videoEl = sourceVideo as HTMLVideoElement & { captureStream?: () => MediaStream };
      if (typeof videoEl.captureStream === 'function') {
        const videoStream = videoEl.captureStream();
        const audioTracks = videoStream.getAudioTracks();
        audioTracks.forEach(track => stream.addTrack(track));
      }

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: opts.videoBitrate,
        audioBitsPerSecond: opts.audioBitrate,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // Promise to wait for recording to complete
      const recordingComplete = new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
          resolve(blob);
        };
        mediaRecorder.onerror = (e) => {
          reject(new Error(`Recording failed: ${(e as any).error?.message || 'Unknown error'}`));
        };
      });

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      setRenderProgress({ stage: 'rendering', progress: 5, message: 'Starting render...' });

      // Render frames
      const duration = sourceVideo.duration;
      const frameInterval = 1 / opts.frameRate;
      let currentTime = 0;

      // Reset video to start
      sourceVideo.currentTime = 0;
      await new Promise(resolve => {
        sourceVideo.onseeked = resolve;
      });

      while (currentTime < duration && !abortRef.current) {
        // Seek to current frame
        sourceVideo.currentTime = currentTime;
        await new Promise(resolve => {
          sourceVideo.onseeked = resolve;
        });

        // Draw frame - use effects canvas if available, otherwise source video
        if (effectsCanvas) {
          ctx.drawImage(effectsCanvas, 0, 0, opts.width, opts.height);
        } else {
          ctx.drawImage(sourceVideo, 0, 0, opts.width, opts.height);
        }

        // Update progress
        const progress = Math.round((currentTime / duration) * 85) + 10;
        setRenderProgress({
          stage: 'rendering',
          progress,
          message: `Rendering frame ${Math.round(currentTime * opts.frameRate)} / ${Math.round(duration * opts.frameRate)}`,
        });

        currentTime += frameInterval;

        // Yield to UI thread
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      if (abortRef.current) {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        throw new Error('Render cancelled');
      }

      // Stop recording
      setRenderProgress({ stage: 'encoding', progress: 95, message: 'Encoding video...' });
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());

      // Wait for final blob
      const blob = await recordingComplete;

      setRenderProgress({ stage: 'complete', progress: 100, message: 'Render complete!' });
      setIsRendering(false);

      return blob;

    } catch (err) {
      console.error('Video render failed:', err);
      setRenderProgress({
        stage: 'failed',
        progress: 0,
        message: err instanceof Error ? err.message : 'Render failed',
      });
      setIsRendering(false);
      return null;
    }
  }, []);

  /**
   * Quick export using source video directly (no effects processing).
   * Much faster as it copies the original video data.
   */
  const quickExportVideo = useCallback(async (
    file: File
  ): Promise<Blob | null> => {
    setIsRendering(true);
    setRenderProgress({ stage: 'preparing', progress: 50, message: 'Preparing export...' });

    try {
      // For quick export, we return the original file as a blob
      // In a production system, you'd transcode here
      setRenderProgress({ stage: 'complete', progress: 100, message: 'Export ready!' });
      setIsRendering(false);
      return file;
    } catch (err) {
      setRenderProgress({
        stage: 'failed',
        progress: 0,
        message: err instanceof Error ? err.message : 'Export failed',
      });
      setIsRendering(false);
      return null;
    }
  }, []);

  const cancelRender = useCallback(() => {
    abortRef.current = true;
  }, []);

  return {
    isRendering,
    renderProgress,
    renderVideo,
    quickExportVideo,
    cancelRender,
  };
}
