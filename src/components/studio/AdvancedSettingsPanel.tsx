import { useState } from 'react';
import { type AdvancedSettings, DEFAULT_ADVANCED_SETTINGS } from '@/lib/advancedPresets';
import { cn } from '@/lib/utils';
import { 
  Settings2, Sparkles, Film, Eye, Camera, Tv, RotateCcw, 
  ChevronDown, ChevronRight, Sliders, HelpCircle 
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';

interface AdvancedSettingsPanelProps {
  settings: AdvancedSettings;
  onSettingsChange: (settings: AdvancedSettings) => void;
  disabled?: boolean;
}

export default function AdvancedSettingsPanel({
  settings,
  onSettingsChange,
  disabled,
}: AdvancedSettingsPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sharpening: false,
    noiseReduction: false,
    lensEffects: true,
    filmEmulation: false,
    output: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleReset = () => {
    onSettingsChange(DEFAULT_ADVANCED_SETTINGS);
  };

  const updateSetting = <K extends keyof AdvancedSettings>(
    category: K,
    updates: Partial<AdvancedSettings[K]>
  ) => {
    onSettingsChange({
      ...settings,
      [category]: { ...settings[category], ...updates },
    });
  };

  const isModified = JSON.stringify(settings) !== JSON.stringify(DEFAULT_ADVANCED_SETTINGS);

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    enabled: boolean,
    onToggle: (val: boolean) => void,
    children: React.ReactNode
  ) => (
    <Collapsible open={expandedSections[id]} onOpenChange={() => toggleSection(id)}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
            expandedSections[id]
              ? 'bg-muted/50 border-primary/30'
              : 'bg-muted/20 border-border/30 hover:border-border/50'
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {expandedSections[id] ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            {icon}
            <span className="text-xs font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {enabled && (
              <Badge variant="secondary" className="text-[8px] bg-primary/10 text-primary">
                ON
              </Badge>
            )}
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={disabled}
              className="scale-75"
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-3 pb-1 px-1 space-y-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  const SliderControl = ({
    label,
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = '',
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    step?: number;
    unit?: string;
  }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono font-medium">
          {value}{unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-accent" />
            <span className="panel-title">Advanced Settings</span>
          <InsightTooltip hint={{ id: 'advanced-settings', title: 'Advanced Settings', description: 'Professional-grade controls for sharpening, noise reduction, lens effects, and film emulation.' }} side="right">
            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
          </InsightTooltip>
          </div>
          <div className="flex items-center gap-2">
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[9px] gap-1 text-muted-foreground hover:text-foreground"
                onClick={handleReset}
                disabled={disabled}
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </Button>
            )}
            <Badge variant="outline" className="text-[8px]">
              PRO
            </Badge>
          </div>
        </div>

        <div className="p-3 space-y-2">
          {/* Sharpening */}
          {renderSection(
            'sharpening',
            'Sharpening',
            <Sparkles className="w-3.5 h-3.5 text-accent" />,
            settings.sharpening.enabled,
            (val) => updateSetting('sharpening', { enabled: val }),
            <>
              <SliderControl
                label="Amount"
                value={settings.sharpening.amount}
                onChange={(v) => updateSetting('sharpening', { amount: v })}
                min={0}
                max={100}
                unit="%"
              />
              <SliderControl
                label="Radius"
                value={settings.sharpening.radius}
                onChange={(v) => updateSetting('sharpening', { radius: v })}
                min={0.5}
                max={3}
                step={0.1}
                unit="px"
              />
              <SliderControl
                label="Threshold"
                value={settings.sharpening.threshold}
                onChange={(v) => updateSetting('sharpening', { threshold: v })}
                min={0}
                max={255}
              />
            </>
          )}

          {/* Noise Reduction */}
          {renderSection(
            'noiseReduction',
            'Noise Reduction',
            <Sliders className="w-3.5 h-3.5 text-success" />,
            settings.noiseReduction.enabled,
            (val) => updateSetting('noiseReduction', { enabled: val }),
            <>
              <SliderControl
                label="Luminance"
                value={settings.noiseReduction.luminance}
                onChange={(v) => updateSetting('noiseReduction', { luminance: v })}
                min={0}
                max={100}
                unit="%"
              />
              <SliderControl
                label="Color"
                value={settings.noiseReduction.color}
                onChange={(v) => updateSetting('noiseReduction', { color: v })}
                min={0}
                max={100}
                unit="%"
              />
              <SliderControl
                label="Detail Preservation"
                value={settings.noiseReduction.detail}
                onChange={(v) => updateSetting('noiseReduction', { detail: v })}
                min={0}
                max={100}
                unit="%"
              />
            </>
          )}

          {/* Lens Effects */}
          {renderSection(
            'lensEffects',
            'Lens Effects',
            <Camera className="w-3.5 h-3.5 text-primary" />,
            settings.lensEffects.vignette.amount > 0 || settings.lensEffects.chromaticAberration > 0,
            () => {},
            <>
              <SliderControl
                label="Chromatic Aberration"
                value={settings.lensEffects.chromaticAberration}
                onChange={(v) => updateSetting('lensEffects', { chromaticAberration: v })}
                min={0}
                max={100}
                unit="%"
              />
              <SliderControl
                label="Lens Distortion"
                value={settings.lensEffects.distortion}
                onChange={(v) => updateSetting('lensEffects', { distortion: v })}
                min={-100}
                max={100}
              />
              <div className="pt-2 border-t border-border/30">
                <p className="text-[9px] uppercase text-muted-foreground mb-2">Vignette</p>
                <div className="space-y-2">
                  <SliderControl
                    label="Amount"
                    value={settings.lensEffects.vignette.amount}
                    onChange={(v) =>
                      updateSetting('lensEffects', {
                        vignette: { ...settings.lensEffects.vignette, amount: v },
                      })
                    }
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <SliderControl
                    label="Midpoint"
                    value={settings.lensEffects.vignette.midpoint}
                    onChange={(v) =>
                      updateSetting('lensEffects', {
                        vignette: { ...settings.lensEffects.vignette, midpoint: v },
                      })
                    }
                    min={0}
                    max={100}
                    unit="%"
                  />
                  <SliderControl
                    label="Feather"
                    value={settings.lensEffects.vignette.feather}
                    onChange={(v) =>
                      updateSetting('lensEffects', {
                        vignette: { ...settings.lensEffects.vignette, feather: v },
                      })
                    }
                    min={0}
                    max={100}
                    unit="%"
                  />
                </div>
              </div>
            </>
          )}

          {/* Film Emulation */}
          {renderSection(
            'filmEmulation',
            'Film Emulation',
            <Film className="w-3.5 h-3.5 text-warning" />,
            settings.filmEmulation.grain.enabled || settings.filmEmulation.halation.enabled,
            () => {},
            <>
              {/* Film Grain */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase text-muted-foreground">Film Grain</span>
                  <Switch
                    checked={settings.filmEmulation.grain.enabled}
                    onCheckedChange={(v) =>
                      updateSetting('filmEmulation', {
                        grain: { ...settings.filmEmulation.grain, enabled: v },
                      })
                    }
                    disabled={disabled}
                    className="scale-75"
                  />
                </div>
                {settings.filmEmulation.grain.enabled && (
                  <div className="space-y-2 pl-2 border-l-2 border-warning/30">
                    <SliderControl
                      label="Amount"
                      value={settings.filmEmulation.grain.amount}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          grain: { ...settings.filmEmulation.grain, amount: v },
                        })
                      }
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <SliderControl
                      label="Size"
                      value={settings.filmEmulation.grain.size}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          grain: { ...settings.filmEmulation.grain, size: v },
                        })
                      }
                      min={0.5}
                      max={5}
                      step={0.1}
                    />
                  </div>
                )}
              </div>

              {/* Halation */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase text-muted-foreground">Halation (Glow)</span>
                  <Switch
                    checked={settings.filmEmulation.halation.enabled}
                    onCheckedChange={(v) =>
                      updateSetting('filmEmulation', {
                        halation: { ...settings.filmEmulation.halation, enabled: v },
                      })
                    }
                    disabled={disabled}
                    className="scale-75"
                  />
                </div>
                {settings.filmEmulation.halation.enabled && (
                  <div className="space-y-2 pl-2 border-l-2 border-warning/30">
                    <SliderControl
                      label="Amount"
                      value={settings.filmEmulation.halation.amount}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          halation: { ...settings.filmEmulation.halation, amount: v },
                        })
                      }
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <SliderControl
                      label="Threshold"
                      value={settings.filmEmulation.halation.threshold}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          halation: { ...settings.filmEmulation.halation, threshold: v },
                        })
                      }
                      min={0}
                      max={100}
                      unit="%"
                    />
                  </div>
                )}
              </div>

              {/* Film Damage */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase text-muted-foreground">Film Damage</span>
                  <Switch
                    checked={settings.filmEmulation.filmDamage.enabled}
                    onCheckedChange={(v) =>
                      updateSetting('filmEmulation', {
                        filmDamage: { ...settings.filmEmulation.filmDamage, enabled: v },
                      })
                    }
                    disabled={disabled}
                    className="scale-75"
                  />
                </div>
                {settings.filmEmulation.filmDamage.enabled && (
                  <div className="space-y-2 pl-2 border-l-2 border-warning/30">
                    <SliderControl
                      label="Scratches"
                      value={settings.filmEmulation.filmDamage.scratches}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          filmDamage: { ...settings.filmEmulation.filmDamage, scratches: v },
                        })
                      }
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <SliderControl
                      label="Dust"
                      value={settings.filmEmulation.filmDamage.dust}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          filmDamage: { ...settings.filmEmulation.filmDamage, dust: v },
                        })
                      }
                      min={0}
                      max={100}
                      unit="%"
                    />
                    <SliderControl
                      label="Flicker"
                      value={settings.filmEmulation.filmDamage.flicker}
                      onChange={(v) =>
                        updateSetting('filmEmulation', {
                          filmDamage: { ...settings.filmEmulation.filmDamage, flicker: v },
                        })
                      }
                      min={0}
                      max={100}
                      unit="%"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Output Settings */}
          {renderSection(
            'output',
            'Output Settings',
            <Tv className="w-3.5 h-3.5 text-muted-foreground" />,
            true,
            () => {},
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Color Space</span>
                  <Select
                    value={settings.output.colorSpace}
                    onValueChange={(v) => updateSetting('output', { colorSpace: v as any })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-28 h-7 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rec709">Rec. 709</SelectItem>
                      <SelectItem value="rec2020">Rec. 2020</SelectItem>
                      <SelectItem value="dcip3">DCI-P3</SelectItem>
                      <SelectItem value="srgb">sRGB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Bit Depth</span>
                  <Select
                    value={String(settings.output.bitDepth)}
                    onValueChange={(v) => updateSetting('output', { bitDepth: Number(v) as any })}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-20 h-7 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8-bit</SelectItem>
                      <SelectItem value="10">10-bit</SelectItem>
                      <SelectItem value="12">12-bit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Lumetri Scopes</span>
                  <Switch
                    checked={settings.output.lumetriScope}
                    onCheckedChange={(v) => updateSetting('output', { lumetriScope: v })}
                    disabled={disabled}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">Deinterlace</span>
                  <Switch
                    checked={settings.output.deinterlace}
                    onCheckedChange={(v) => updateSetting('output', { deinterlace: v })}
                    disabled={disabled}
                    className="scale-75"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
