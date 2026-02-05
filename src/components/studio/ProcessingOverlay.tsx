import { useMemo } from 'react';
import { Film, Sparkles, Cpu, Zap, Wand2, CheckCircle, Music, Clapperboard } from 'lucide-react';
import { STYLE_PRESETS } from '@/lib/presets';
import { cn } from '@/lib/utils';

interface ProcessingOverlayProps {
  progress: number;
  message: string;
  config: { style: string };
}

// Deterministic pseudo-random from seed (stable across re-renders)
function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function ProcessingOverlay({ progress, message, config }: ProcessingOverlayProps) {
  const styleName = STYLE_PRESETS.find(s => s.id === config.style)?.name || 'Custom';

  const steps = [
    { name: 'Parse', icon: Film, threshold: 25 },
    { name: 'Analyze', icon: Cpu, threshold: 50 },
    { name: 'Edit', icon: Wand2, threshold: 75 },
    { name: 'Export', icon: Sparkles, threshold: 100 },
  ];

  // Stable generated data
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${seeded(i * 7 + 1) * 100}%`,
      top: `${seeded(i * 7 + 2) * 100}%`,
      size: 2 + seeded(i * 7 + 3) * 6,
      delay: seeded(i * 7 + 4) * 8,
      duration: 4 + seeded(i * 7 + 5) * 6,
      dx: (seeded(i * 7 + 6) - 0.5) * 120,
      dy: (seeded(i * 7 + 7) - 0.5) * 120,
    })), []);

  const sparkles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${10 + seeded(i * 3 + 100) * 80}%`,
      top: `${10 + seeded(i * 3 + 101) * 80}%`,
      delay: seeded(i * 3 + 102) * 5,
      duration: 1.5 + seeded(i * 3 + 103) * 2,
      size: 8 + seeded(i * 3 + 104) * 16,
    })), []);

  const waveBars = useMemo(() =>
    Array.from({ length: 32 }, (_, i) => ({
      id: i,
      delay: i * 0.08,
      minH: 4 + seeded(i + 200) * 6,
      maxH: 16 + seeded(i + 300) * 28,
      speed: 0.6 + seeded(i + 500) * 0.8,
    })), []);

  const filmFrames = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      opacity: 0.15 + seeded(i + 400) * 0.25,
    })), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* === LAYER 1: Deep backdrop === */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />

      {/* === LAYER 2: Aurora gradient blobs === */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            left: '10%',
            top: '20%',
            animation: 'proc-aurora-1 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
            right: '5%',
            bottom: '10%',
            animation: 'proc-aurora-2 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: 'radial-gradient(circle, hsl(var(--success)) 0%, transparent 70%)',
            left: '50%',
            top: '50%',
            marginLeft: '-200px',
            marginTop: '-200px',
            animation: 'proc-aurora-3 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* === LAYER 3: Floating particles === */}
      <div className="absolute inset-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0) 70%)`,
              animation: `proc-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
            }}
          />
        ))}
      </div>

      {/* === LAYER 4: Sparkle bursts === */}
      <div className="absolute inset-0">
        {sparkles.map(s => (
          <div
            key={s.id}
            className="absolute"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animation: `proc-sparkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          >
            <Sparkles className="w-full h-full text-primary/40" />
          </div>
        ))}
      </div>

      {/* === LAYER 5: Film strip (top) === */}
      <div className="absolute top-6 left-0 right-0 h-10 overflow-hidden opacity-20">
        <div
          className="flex gap-1 h-full"
          style={{ width: '200%', animation: 'proc-filmstrip 20s linear infinite' }}
        >
          {[...filmFrames, ...filmFrames].map((f, idx) => (
            <div
              key={idx}
              className="h-full aspect-[16/9] rounded border border-primary/30 bg-primary/5 flex-shrink-0 flex items-center justify-center"
              style={{ opacity: f.opacity }}
            >
              <Clapperboard className="w-3 h-3 text-primary/40" />
            </div>
          ))}
        </div>
      </div>

      {/* === LAYER 5b: Film strip (bottom, reverse) === */}
      <div className="absolute bottom-6 left-0 right-0 h-10 overflow-hidden opacity-15">
        <div
          className="flex gap-1 h-full"
          style={{ width: '200%', animation: 'proc-filmstrip 25s linear infinite reverse' }}
        >
          {[...filmFrames, ...filmFrames].map((f, idx) => (
            <div
              key={idx}
              className="h-full aspect-[16/9] rounded border border-accent/30 bg-accent/5 flex-shrink-0 flex items-center justify-center"
              style={{ opacity: f.opacity }}
            >
              <Film className="w-3 h-3 text-accent/40" />
            </div>
          ))}
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 text-center space-y-8 animate-fade-in max-w-lg mx-auto px-6">

        {/* Orbiting rings + pulsing waves + main icon */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Pulse rings expanding outward */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/20"
              style={{ animation: `proc-pulse-ring 3s ease-out ${i}s infinite` }}
            />
          ))}

          {/* Outer orbit ring with dots */}
          <div
            className="absolute -inset-6 rounded-full"
            style={{ animation: 'proc-orbit 8s linear infinite' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))]" />
          </div>

          {/* Inner orbit ring (reverse) */}
          <div
            className="absolute -inset-3 rounded-full"
            style={{ animation: 'proc-orbit-reverse 6s linear infinite' }}
          >
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-success shadow-[0_0_8px_hsl(var(--success))]" />
          </div>

          {/* Dashed orbit path */}
          <div
            className="absolute -inset-6 rounded-full border border-dashed border-primary/10"
            style={{ animation: 'proc-orbit 20s linear infinite' }}
          />

          {/* Main icon container */}
          <div
            className="relative w-full h-full rounded-3xl border border-primary/30 flex items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.5) 100%)',
              animation: 'proc-breathe 3s ease-in-out infinite, proc-glow-pulse 3s ease-in-out infinite',
            }}
          >
            {/* Inner radial highlight */}
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: 'radial-gradient(circle at 30% 30%, hsl(var(--primary) / 0.4), transparent 60%)' }}
            />

            {/* Scan line */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-scan"
                style={{ top: '50%' }}
              />
            </div>

            {/* Icon with subtle glitch */}
            <div style={{ animation: 'proc-glitch 4s linear infinite' }}>
              <Film className="w-12 h-12 text-primary relative z-10" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h3 className="text-2xl font-display font-bold flex items-center justify-center gap-3 tracking-wide">
            <Zap className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-gradient">AI Processing</span>
            <Zap className="w-5 h-5 text-accent animate-pulse" style={{ animationDelay: '0.3s' }} />
          </h3>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            {message}
            <span
              className="inline-block w-0.5 h-4 bg-primary ml-0.5"
              style={{ animation: 'proc-cursor-blink 0.8s step-end infinite' }}
            />
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border/40">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-xs text-muted-foreground">{styleName}</span>
          </div>
        </div>

        {/* Audio waveform visualization */}
        <div className="flex items-center justify-center gap-[3px] h-10 px-6">
          {waveBars.map(bar => (
            <div
              key={bar.id}
              className="w-[3px] rounded-full bg-gradient-to-t from-primary/60 to-accent/60"
              style={{
                animation: `proc-wave ${bar.speed}s ease-in-out ${bar.delay}s infinite`,
                ['--wave-min' as string]: `${bar.minH}px`,
                ['--wave-max' as string]: `${bar.maxH}px`,
                height: `${bar.minH}px`,
              }}
            />
          ))}
        </div>

        {/* Progress bar with glow tip */}
        <div className="w-72 mx-auto space-y-2">
          <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/30 relative">
            <div
              className="h-full rounded-full relative transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
                backgroundSize: '200% 100%',
                animation: 'scan 2s linear infinite',
              }}
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ animation: 'scan 1.5s linear infinite' }}
              />
            </div>
            {progress > 0 && progress < 100 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/50 blur-sm transition-all duration-500"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">Processing</span>
            <span className="font-mono font-bold text-primary text-sm">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-6">
          {steps.map((step, i) => {
            const isComplete = progress >= step.threshold;
            const isActive = progress > (i === 0 ? 0 : steps[i - 1].threshold) && progress < step.threshold;
            const Icon = step.icon;

            return (
              <div key={step.name} className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-500',
                    isComplete
                      ? 'bg-success/20 border-success/50 text-success'
                      : isActive
                        ? 'bg-primary/20 border-primary/50 text-primary scale-110'
                        : 'bg-muted/30 border-border/40 text-muted-foreground'
                  )}
                  style={isActive ? { animation: 'proc-breathe 2s ease-in-out infinite, proc-glow-pulse 2s ease-in-out infinite' } : undefined}
                >
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className={cn('w-5 h-5', isActive && 'animate-pulse')} />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300',
                  isComplete ? 'text-success' : isActive ? 'text-primary' : 'text-muted-foreground/60'
                )}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* AI badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20">
            <Music className="w-3.5 h-3.5 text-accent animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Powered by OpenAI & Gemini</span>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Cpu className="w-3.5 h-3.5 text-primary animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
