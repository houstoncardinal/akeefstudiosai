/**
 * Real audio analysis using Web Audio API
 * Extracts BPM, energy curve, and waveform data from video/audio files
 */

export interface AudioAnalysisResult {
  bpm: number;
  energyCurve: number[];
  beatTimestamps: number[];
  duration: number;
}

/**
 * Extract audio buffer from a File (video or audio)
 */
async function decodeAudioFromFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  try {
    return await audioContext.decodeAudioData(arrayBuffer);
  } finally {
    await audioContext.close();
  }
}

/**
 * Compute RMS energy for segments of an audio buffer
 */
function computeEnergyCurve(buffer: AudioBuffer, segments: number): number[] {
  const data = buffer.getChannelData(0);
  const segmentSize = Math.floor(data.length / segments);
  const curve: number[] = [];

  for (let i = 0; i < segments; i++) {
    const start = i * segmentSize;
    const end = Math.min(start + segmentSize, data.length);
    let sumSquares = 0;
    for (let j = start; j < end; j++) {
      sumSquares += data[j] * data[j];
    }
    const rms = Math.sqrt(sumSquares / (end - start));
    curve.push(rms);
  }

  // Normalize to 0-1
  const max = Math.max(...curve, 0.001);
  return curve.map(v => v / max);
}

/**
 * Detect BPM using onset detection + autocorrelation
 * Works by:
 * 1. Computing spectral flux (energy change over time)
 * 2. Finding peaks (onsets)
 * 3. Using autocorrelation on the onset signal to find periodicity
 */
function detectBPMFromBuffer(buffer: AudioBuffer): { bpm: number; beatTimestamps: number[] } {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;

  // Compute energy in short windows (hop = ~10ms)
  const windowSize = Math.floor(sampleRate * 0.02); // 20ms windows
  const hopSize = Math.floor(sampleRate * 0.01);     // 10ms hop
  const numFrames = Math.floor((data.length - windowSize) / hopSize);

  const energy: number[] = [];
  for (let i = 0; i < numFrames; i++) {
    const start = i * hopSize;
    let sum = 0;
    for (let j = start; j < start + windowSize; j++) {
      sum += data[j] * data[j];
    }
    energy.push(sum / windowSize);
  }

  // Compute spectral flux (positive energy differences)
  const flux: number[] = [0];
  for (let i = 1; i < energy.length; i++) {
    const diff = energy[i] - energy[i - 1];
    flux.push(diff > 0 ? diff : 0);
  }

  // Adaptive threshold for onset detection
  const thresholdWindowSize = 10;
  const onsets: number[] = [];
  const beatTimestamps: number[] = [];

  for (let i = thresholdWindowSize; i < flux.length - thresholdWindowSize; i++) {
    let localMean = 0;
    for (let j = i - thresholdWindowSize; j <= i + thresholdWindowSize; j++) {
      localMean += flux[j];
    }
    localMean /= thresholdWindowSize * 2 + 1;

    if (flux[i] > localMean * 1.5 && flux[i] > 0.0001) {
      // Check it's a local peak
      if (flux[i] >= flux[i - 1] && flux[i] >= flux[i + 1]) {
        onsets.push(i);
        beatTimestamps.push((i * hopSize) / sampleRate);
      }
    }
  }

  // Autocorrelation on onset signal to find BPM
  // Create binary onset signal
  const onsetSignal = new Float32Array(flux.length);
  for (const onset of onsets) {
    onsetSignal[onset] = 1;
  }

  // Autocorrelation for BPM range 60-200 (corresponding to lag in frames)
  const minBPM = 60;
  const maxBPM = 200;
  const framesPerSecond = sampleRate / hopSize;
  const minLag = Math.floor((60 / maxBPM) * framesPerSecond);
  const maxLag = Math.floor((60 / minBPM) * framesPerSecond);

  let bestLag = minLag;
  let bestCorr = -Infinity;

  for (let lag = minLag; lag <= Math.min(maxLag, onsetSignal.length / 2); lag++) {
    let corr = 0;
    const limit = Math.min(onsetSignal.length - lag, 2000); // limit computation
    for (let i = 0; i < limit; i++) {
      corr += onsetSignal[i] * onsetSignal[i + lag];
    }
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  const bpm = Math.round((60 * framesPerSecond) / bestLag);

  // Clamp to reasonable range
  const clampedBPM = Math.max(minBPM, Math.min(maxBPM, bpm));

  return { bpm: clampedBPM, beatTimestamps };
}

/**
 * Full audio analysis pipeline
 * @param file - Video or audio file
 * @param energySegments - Number of segments for energy curve (default 50)
 * @param onProgress - Progress callback (0-100)
 */
export async function analyzeAudio(
  file: File,
  energySegments = 50,
  onProgress?: (progress: number) => void
): Promise<AudioAnalysisResult> {
  onProgress?.(5);

  // Decode audio
  const buffer = await decodeAudioFromFile(file);
  onProgress?.(40);

  // Detect BPM
  const { bpm, beatTimestamps } = detectBPMFromBuffer(buffer);
  onProgress?.(70);

  // Compute energy curve
  const energyCurve = computeEnergyCurve(buffer, energySegments);
  onProgress?.(95);

  onProgress?.(100);

  return {
    bpm,
    energyCurve,
    beatTimestamps,
    duration: buffer.duration,
  };
}
