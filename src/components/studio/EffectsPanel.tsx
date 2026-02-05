import { useState, useEffect } from 'react';
import { EFFECT_PRESETS } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { Zap, Film, Minimize2, Clock, Activity, CheckCircle, Sparkles, X } from 'lucide-react';

export interface EffectOverrides {
  disabledTransitions: string[];
  disabledMotionEffects: string[];
}

interface EffectsPanelProps {
  effectPreset: string;
  onEffectPresetChange: (preset: string) => void;
  onEffectOverridesChange?: (overrides: EffectOverrides) => void;
  disabled?: boolean;
}

const icons: Record<string, typeof Zap> = {
  hype_mode: Zap,
  cinematic_mode: Film,
  clean_mode: Minimize2,
  retro_mode: Clock,
  dynamic_mode: Activity,
};

const intensityColors: Record<string, string> = {
  subtle: 'text-success',
  moderate: 'text-warning',
  intense: 'text-destructive',
};

export default function EffectsPanel({ effectPreset, onEffectPresetChange, onEffectOverridesChange, disabled }: EffectsPanelProps) {
  const selected = EFFECT_PRESETS.find(e => e.id === effectPreset);
  const [disabledTransitions, setDisabledTransitions] = useState<string[]>([]);
  const [disabledMotionEffects, setDisabledMotionEffects] = useState<string[]>([]);

  // Reset overrides when preset changes
  useEffect(() => {
    setDisabledTransitions([]);
    setDisabledMotionEffects([]);
  }, [effectPreset]);

  const toggleTransition = (t: string) => {
    setDisabledTransitions(prev => {
      const updated = prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t];
      onEffectOverridesChange?.({ disabledTransitions: updated, disabledMotionEffects });
      return updated;
    });
  };

  const toggleMotionEffect = (e: string) => {
    setDisabledMotionEffects(prev => {
      const updated = prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e];
      onEffectOverridesChange?.({ disabledTransitions, disabledMotionEffects: updated });
      return updated;
    });
  };

  return (
    <div className="space-y-5">
      {/* Effect Modes */}
      <div className="panel relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-2xl" />
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Effect Modes</span>
          </div>
          <Zap className="w-3.5 h-3.5 text-accent" />
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EFFECT_PRESETS.map((preset) => {
            const Icon = icons[preset.id] || Zap;
            const active = effectPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => !disabled && onEffectPresetChange(preset.id)}
                disabled={disabled}
                className={cn('preset-card text-left p-4 space-y-3', active && 'active')}
              >
                <div className="flex items-center justify-between">
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center border transition-colors',
                    active
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/50 border-border/30'
                  )}>
                    <Icon className={cn('w-4.5 h-4.5', active ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <span className={cn('text-[9px] uppercase font-medium', intensityColors[preset.intensity])}>
                    {preset.intensity}
                  </span>
                </div>
                <div>
                  <p className={cn('text-xs font-semibold', active && 'text-primary')}>{preset.name}</p>
                  <p className="text-[9px] text-muted-foreground line-clamp-2 mt-0.5">{preset.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Effect Details — toggleable */}
      {selected && (
        <div className="panel relative overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-success" />
              <span className="panel-title">Active Effects</span>
            </div>
            <span className={cn('text-[9px] uppercase font-bold', intensityColors[selected.intensity])}>
              {selected.intensity}
            </span>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-[10px] text-muted-foreground">
              Click an effect to toggle it on/off within this preset.
            </p>
            <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2 tracking-wider font-medium">Transitions</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.transitions.map((t) => {
                  const isDisabled = disabledTransitions.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTransition(t)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all',
                        isDisabled
                          ? 'bg-muted/20 text-muted-foreground/50 border-border/20 line-through'
                          : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                      )}
                    >
                      {isDisabled && <X className="w-2.5 h-2.5 inline mr-1" />}
                      {t.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[9px] uppercase text-muted-foreground mb-2 tracking-wider font-medium">Motion Effects</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.motionEffects.map((e) => {
                  const isDisabled = disabledMotionEffects.includes(e);
                  return (
                    <button
                      key={e}
                      onClick={() => toggleMotionEffect(e)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all',
                        isDisabled
                          ? 'bg-muted/20 text-muted-foreground/50 border-border/20 line-through'
                          : 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20'
                      )}
                    >
                      {isDisabled && <X className="w-2.5 h-2.5 inline mr-1" />}
                      {e.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Summary */}
            {(disabledTransitions.length > 0 || disabledMotionEffects.length > 0) && (
              <div className="bg-muted/20 rounded-md p-2 border border-border/30">
                <p className="text-[9px] text-muted-foreground">
                  {disabledTransitions.length + disabledMotionEffects.length} effect(s) disabled from preset
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
