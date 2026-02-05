import { VERTEX_SHADER, FRAGMENT_SHADER } from './colorGradingShaders';

export interface FullColorSettings {
  contrast: number;
  saturation: number;
  temperature: number;
  tint: number;
  shadows: number;
  highlights: number;
  lift: { r: number; g: number; b: number };
  gamma: { r: number; g: number; b: number };
  gain: { r: number; g: number; b: number };
}

export interface EffectSettings {
  grainAmount: number;
  grainSize: number;
  vignetteAmount: number;
  vignetteMidpoint: number;
  vignetteFeather: number;
}

export const DEFAULT_COLOR_SETTINGS: FullColorSettings = {
  contrast: 1,
  saturation: 1,
  temperature: 0,
  tint: 0,
  shadows: 0,
  highlights: 0,
  lift: { r: 0, g: 0, b: 0 },
  gamma: { r: 1, g: 1, b: 1 },
  gain: { r: 1, g: 1, b: 1 },
};

export const DEFAULT_EFFECT_SETTINGS: EffectSettings = {
  grainAmount: 0,
  grainSize: 1,
  vignetteAmount: 0,
  vignetteMidpoint: 70,
  vignetteFeather: 30,
};

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private videoTexture: WebGLTexture;
  private uniforms: Map<string, WebGLUniformLocation> = new Map();
  private animFrameId: number | null = null;
  private video: HTMLVideoElement | null = null;
  private needsRedraw = true;
  private splitPosition = -1;
  private resizeObserver: ResizeObserver | null = null;
  private isDisposed = false;
  private canvas: HTMLCanvasElement;
  private startTime = performance.now();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    this.program = this.createProgram();
    this.videoTexture = this.createVideoTexture();
    this.cacheUniformLocations();
    this.setupGeometry();
    this.setDefaultUniforms();
    this.setupResizeObserver();

    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private createProgram(): WebGLProgram {
    const { gl } = this;
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'aPosition');
    gl.bindAttribLocation(program, 1, 'aTexCoord');
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Shader link failed: ${info}`);
    }

    gl.useProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return program;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile failed: ${info}`);
    }
    return shader;
  }

  private createVideoTexture(): WebGLTexture {
    const { gl } = this;
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Initialize with 1x1 black pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
    return texture;
  }

  private cacheUniformLocations() {
    const { gl, program } = this;
    const names = [
      'uVideoTexture',
      'uContrast', 'uSaturation', 'uTemperature', 'uTint',
      'uShadows', 'uHighlights',
      'uLift', 'uGamma', 'uGain',
      'uGrainAmount', 'uGrainSize', 'uTime',
      'uVignetteAmount', 'uVignetteMidpoint', 'uVignetteFeather',
      'uSplitPosition', 'uResolution',
    ];
    for (const name of names) {
      const loc = gl.getUniformLocation(program, name);
      if (loc !== null) this.uniforms.set(name, loc);
    }
  }

  private setupGeometry() {
    const { gl } = this;
    // Full-screen quad: position (x,y) + texcoord (s,t)
    // Texture Y is flipped for video
    const vertices = new Float32Array([
      -1, -1,  0, 1,
       1, -1,  1, 1,
      -1,  1,  0, 0,
       1,  1,  1, 0,
    ]);

    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // aPosition
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
    // aTexCoord
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
  }

  private setDefaultUniforms() {
    this.updateColorSettings(DEFAULT_COLOR_SETTINGS);
    this.updateEffects(DEFAULT_EFFECT_SETTINGS);
    this.setUniform1f('uSplitPosition', -1);
    this.setUniform1i('uVideoTexture', 0);
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.round(width * dpr);
        const h = Math.round(height * dpr);
        if (this.canvas.width !== w || this.canvas.height !== h) {
          this.canvas.width = w;
          this.canvas.height = h;
          this.gl.viewport(0, 0, w, h);
          this.setUniform2f('uResolution', w, h);
          this.needsRedraw = true;
        }
      }
    });
    this.resizeObserver.observe(this.canvas);
  }

  // --- Public API ---

  setVideoSource(video: HTMLVideoElement) {
    this.video = video;
    this.needsRedraw = true;
  }

  updateColorSettings(settings: FullColorSettings) {
    this.setUniform1f('uContrast', settings.contrast);
    this.setUniform1f('uSaturation', settings.saturation);
    this.setUniform1f('uTemperature', settings.temperature);
    this.setUniform1f('uTint', settings.tint);
    this.setUniform1f('uShadows', settings.shadows);
    this.setUniform1f('uHighlights', settings.highlights);
    this.setUniform3f('uLift', settings.lift.r, settings.lift.g, settings.lift.b);
    this.setUniform3f('uGamma', settings.gamma.r, settings.gamma.g, settings.gamma.b);
    this.setUniform3f('uGain', settings.gain.r, settings.gain.g, settings.gain.b);
    this.needsRedraw = true;
  }

  updateEffects(effects: EffectSettings) {
    this.setUniform1f('uGrainAmount', effects.grainAmount);
    this.setUniform1f('uGrainSize', effects.grainSize);
    this.setUniform1f('uVignetteAmount', effects.vignetteAmount);
    this.setUniform1f('uVignetteMidpoint', effects.vignetteMidpoint);
    this.setUniform1f('uVignetteFeather', effects.vignetteFeather);
    this.needsRedraw = true;
  }

  setSplitPosition(position: number | null) {
    this.splitPosition = position ?? -1;
    this.setUniform1f('uSplitPosition', this.splitPosition);
    this.needsRedraw = true;
  }

  renderFrame() {
    if (this.isDisposed) return;
    const { gl } = this;

    if (this.video && this.video.readyState >= 2) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
    }

    this.setUniform1f('uTime', (performance.now() - this.startTime) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  startRenderLoop() {
    if (this.animFrameId !== null) return;
    const loop = () => {
      if (this.isDisposed) return;
      if (this.video && !this.video.paused) {
        this.renderFrame();
      } else if (this.needsRedraw) {
        this.renderFrame();
        this.needsRedraw = false;
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  captureFrame(): ImageData | null {
    if (this.isDisposed) return null;
    const { gl } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return null;

    // Render a fresh frame for capture
    this.renderFrame();

    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    // Flip Y (WebGL reads bottom-up)
    const rowSize = w * 4;
    const halfHeight = Math.floor(h / 2);
    const tempRow = new Uint8Array(rowSize);
    for (let y = 0; y < halfHeight; y++) {
      const top = y * rowSize;
      const bottom = (h - 1 - y) * rowSize;
      tempRow.set(pixels.subarray(top, top + rowSize));
      pixels.copyWithin(top, bottom, bottom + rowSize);
      pixels.set(tempRow, bottom);
    }

    return new ImageData(new Uint8ClampedArray(pixels.buffer), w, h);
  }

  dispose() {
    this.isDisposed = true;
    this.stopRenderLoop();
    this.resizeObserver?.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);

    const { gl } = this;
    gl.deleteTexture(this.videoTexture);
    gl.deleteProgram(this.program);
  }

  // --- Helpers ---

  private setUniform1f(name: string, value: number) {
    const loc = this.uniforms.get(name);
    if (loc) this.gl.uniform1f(loc, value);
  }

  private setUniform1i(name: string, value: number) {
    const loc = this.uniforms.get(name);
    if (loc) this.gl.uniform1i(loc, value);
  }

  private setUniform2f(name: string, x: number, y: number) {
    const loc = this.uniforms.get(name);
    if (loc) this.gl.uniform2f(loc, x, y);
  }

  private setUniform3f(name: string, x: number, y: number, z: number) {
    const loc = this.uniforms.get(name);
    if (loc) this.gl.uniform3f(loc, x, y, z);
  }

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this.stopRenderLoop();
  };

  private handleContextRestored = () => {
    this.program = this.createProgram();
    this.videoTexture = this.createVideoTexture();
    this.cacheUniformLocations();
    this.setupGeometry();
    this.setDefaultUniforms();
    this.needsRedraw = true;
    this.startRenderLoop();
  };
}
