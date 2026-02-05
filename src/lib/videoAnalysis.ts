/**
 * Real video analysis using Canvas API
 * Detects scene changes, frame brightness, and composition from video files
 */

export interface SceneChange {
  timestamp: number;
  brightness: number;
  dominantColor: { r: number; g: number; b: number };
  difference: number;
}

export interface VideoAnalysisResult {
  sceneChanges: SceneChange[];
  duration: number;
  averageBrightness: number;
  frameCount: number;
}

/**
 * Analyze a single frame from canvas context
 */
function analyzeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { brightness: number; color: { r: number; g: number; b: number }; pixels: Uint8ClampedArray } {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let totalR = 0, totalG = 0, totalB = 0, totalBrightness = 0;
  const pixelCount = pixels.length / 4;

  // Sample every 4th pixel for performance
  const step = 4;
  let sampledCount = 0;

  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    totalR += r;
    totalG += g;
    totalB += b;
    totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
    sampledCount++;
  }

  return {
    brightness: totalBrightness / sampledCount / 255,
    color: {
      r: Math.round(totalR / sampledCount),
      g: Math.round(totalG / sampledCount),
      b: Math.round(totalB / sampledCount),
    },
    pixels: imageData.data,
  };
}

/**
 * Compare two frames by pixel difference
 * Returns a value 0-1 where higher means more different
 */
function compareFrames(
  pixels1: Uint8ClampedArray,
  pixels2: Uint8ClampedArray
): number {
  if (pixels1.length !== pixels2.length) return 1;

  let totalDiff = 0;
  const step = 16; // Sample every 16th pixel for speed
  let count = 0;

  for (let i = 0; i < pixels1.length; i += 4 * step) {
    const dr = Math.abs(pixels1[i] - pixels2[i]);
    const dg = Math.abs(pixels1[i + 1] - pixels2[i + 1]);
    const db = Math.abs(pixels1[i + 2] - pixels2[i + 2]);
    totalDiff += (dr + dg + db) / 3;
    count++;
  }

  return (totalDiff / count) / 255;
}

/**
 * Seek a video element to a specific time and wait for the frame to be ready
 */
function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => resolve(), 2000); // 2s timeout per seek
    const handler = () => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', handler);
      resolve();
    };
    video.addEventListener('seeked', handler);
    video.currentTime = time;
  });
}

/**
 * Full video analysis pipeline
 * Samples frames at regular intervals and detects scene changes
 *
 * @param file - Video file to analyze
 * @param sampleInterval - Seconds between frame samples (default 0.5)
 * @param threshold - Scene change sensitivity 0-1 (default 0.15)
 * @param onProgress - Progress callback (0-100)
 */
export async function analyzeVideo(
  file: File,
  sampleInterval = 0.5,
  threshold = 0.15,
  onProgress?: (progress: number) => void
): Promise<VideoAnalysisResult> {
  // Create offscreen video element
  const video = document.createElement('video');
  video.muted = true;
  video.preload = 'auto';

  const url = URL.createObjectURL(file);
  video.src = url;

  // Wait for video metadata
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video'));
    // Trigger load
    video.load();
  });

  const duration = video.duration;
  if (!duration || !isFinite(duration)) {
    URL.revokeObjectURL(url);
    throw new Error('Could not determine video duration');
  }

  // Create canvas for frame analysis
  const analysisWidth = 160;  // Low res for speed
  const analysisHeight = 90;
  const canvas = document.createElement('canvas');
  canvas.width = analysisWidth;
  canvas.height = analysisHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  const totalFrames = Math.floor(duration / sampleInterval);
  const sceneChanges: SceneChange[] = [];
  let prevPixels: Uint8ClampedArray | null = null;
  let totalBrightness = 0;
  let frameCount = 0;

  onProgress?.(5);

  for (let i = 0; i < totalFrames; i++) {
    const time = i * sampleInterval;

    await seekToTime(video, time);

    // Draw frame to canvas
    ctx.drawImage(video, 0, 0, analysisWidth, analysisHeight);
    const { brightness, color, pixels } = analyzeFrame(ctx, analysisWidth, analysisHeight);

    totalBrightness += brightness;
    frameCount++;

    if (prevPixels) {
      const diff = compareFrames(prevPixels, pixels);
      if (diff > threshold) {
        sceneChanges.push({
          timestamp: time,
          brightness,
          dominantColor: color,
          difference: diff,
        });
      }
    }

    prevPixels = new Uint8ClampedArray(pixels);
    onProgress?.(5 + (i / totalFrames) * 90);
  }

  URL.revokeObjectURL(url);
  onProgress?.(100);

  return {
    sceneChanges,
    duration,
    averageBrightness: totalBrightness / Math.max(frameCount, 1),
    frameCount,
  };
}
