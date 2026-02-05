import { useState, useEffect } from 'react';
import { CINEMATIC_LUTS, type CinematicLUT } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { CheckCircle, Film, Sparkles, Camera, Tv, Music, RotateCcw, Undo2, Redo2, HelpCircle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type FullColorSettings } from '@/lib/webgl/WebGLRenderer';
import ColorWheel from '@/components/studio/ColorWheel';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';

// Legacy compatibility: alias old ColorSettings to the richer FullColorSettings
export type ColorSettings = FullColorSettings;

// Import LUT thumbnails
import tealOrangeThumb from '@/assets/luts/teal-orange.jpg';
import vintageFilmThumb from '@/assets/luts/vintage-film.jpg';
import moodyDesatThumb from '@/assets/luts/moody-desat.jpg';
import vibrantPopThumb from '@/assets/luts/vibrant-pop.jpg';
import neonNightsThumb from '@/assets/luts/neon-nights.jpg';
import cleanNaturalThumb from '@/assets/luts/clean-natural.jpg';
import blockbusterThumb from '@/assets/luts/blockbuster.jpg';
import kodakGoldThumb from '@/assets/luts/kodak-gold.jpg';
import fujiVelviaThumb from '@/assets/luts/fuji-velvia.jpg';
import thrillerColdThumb from '@/assets/luts/thriller-cold.jpg';
import scifiGreenThumb from '@/assets/luts/scifi-green.jpg';
import goldenHourThumb from '@/assets/luts/golden-hour.jpg';
import bwClassicThumb from '@/assets/luts/bw-classic.jpg';
import romanceSoftThumb from '@/assets/luts/romance-soft.jpg';
// New LUT thumbnails
import beachSummerThumb from '@/assets/luts/beach-summer.jpg';
import horrorTealThumb from '@/assets/luts/horror-teal.jpg';
import desertOrangeThumb from '@/assets/luts/desert-orange.jpg';
import sepiaWesternThumb from '@/assets/luts/sepia-western.jpg';
import noirDetectiveThumb from '@/assets/luts/noir-detective.jpg';
import dreamyWeddingThumb from '@/assets/luts/dreamy-wedding.jpg';
import cyberpunkCityThumb from '@/assets/luts/cyberpunk-city.jpg';
import bleachBypassThumb from '@/assets/luts/bleach-bypass.jpg';
import tropicalVibrantThumb from '@/assets/luts/tropical-vibrant.jpg';
import vhsRetroThumb from '@/assets/luts/vhs-retro.jpg';
import autumnWarmThumb from '@/assets/luts/autumn-warm.jpg';
import nordicColdThumb from '@/assets/luts/nordic-cold.jpg';
import instagramFadeThumb from '@/assets/luts/instagram-fade.jpg';
import chiaroscuroThumb from '@/assets/luts/chiaroscuro.jpg';
import polaroidFadeThumb from '@/assets/luts/polaroid-fade.jpg';
import deepOceanThumb from '@/assets/luts/deep-ocean.jpg';

interface ColorPanelProps {
  colorGrade: string;
  onColorGradeChange: (colorGrade: string) => void;
  onColorSettingsChange?: (settings: FullColorSettings) => void;
  settings?: FullColorSettings | null;
  lutThumbnails?: Map<string, string>;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  disabled?: boolean;
}

const thumbnailMap: Record<string, string> = {
  'teal-orange': tealOrangeThumb,
  'vintage-film': vintageFilmThumb,
  'moody-desat': moodyDesatThumb,
  'vibrant-pop': vibrantPopThumb,
  'neon-nights': neonNightsThumb,
  'clean-natural': cleanNaturalThumb,
  'blockbuster': blockbusterThumb,
  'kodak-gold': kodakGoldThumb,
  'fuji-velvia': fujiVelviaThumb,
  'thriller-cold': thrillerColdThumb,
  'scifi-green': scifiGreenThumb,
  'golden-hour': goldenHourThumb,
  'bw-classic': bwClassicThumb,
  'romance-soft': romanceSoftThumb,
  // New thumbnails
  'beach-summer': beachSummerThumb,
  'horror-teal': horrorTealThumb,
  'desert-orange': desertOrangeThumb,
  'sepia-western': sepiaWesternThumb,
  'noir-detective': noirDetectiveThumb,
  'dreamy-wedding': dreamyWeddingThumb,
  'cyberpunk-city': cyberpunkCityThumb,
  'bleach-bypass': bleachBypassThumb,
  'tropical-vibrant': tropicalVibrantThumb,
  'vhs-retro': vhsRetroThumb,
  'autumn-warm': autumnWarmThumb,
  'nordic-cold': nordicColdThumb,
  'instagram-fade': instagramFadeThumb,
  'chiaroscuro': chiaroscuroThumb,
  'polaroid-fade': polaroidFadeThumb,
  'deep-ocean': deepOceanThumb,
};

const categoryIcons: Record<string, typeof Film> = {
  hollywood: Film,
  film_stock: Camera,
  stylized: Sparkles,
  broadcast: Tv,
  music_video: Music,
  documentary: Camera,
  vintage: Film,
  specialty: Sparkles,
};

const categoryLabels: Record<string, string> = {
  hollywood: 'Hollywood',
  film_stock: 'Film Stock',
  stylized: 'Stylized',
  broadcast: 'Broadcast',
  music_video: 'Music Video',
  documentary: 'Documentary',
  vintage: 'Vintage',
  specialty: 'Specialty',
};

export function getLUTDefaults(lut: CinematicLUT): FullColorSettings {
  return {
    contrast: lut.settings.contrast,
    saturation: lut.settings.saturation,
    temperature: lut.settings.temperature,
    tint: lut.settings.tint,
    shadows: lut.settings.shadows,
    highlights: lut.settings.highlights,
    lift: { r: lut.settings.lift, g: lut.settings.lift, b: lut.settings.lift },
    gamma: { r: lut.settings.gamma, g: lut.settings.gamma, b: lut.settings.gamma },
    gain: { r: lut.settings.gain, g: lut.settings.gain, b: lut.settings.gain },
  };
}

function areSettingsEqual(a: FullColorSettings, b: FullColorSettings) {
  const keys: (keyof FullColorSettings)[] = [
    'contrast',
    'saturation',
    'temperature',
    'tint',
    'shadows',
    'highlights',
  ];
  for (const k of keys) {
    if (Math.abs(a[k] as number - (b[k] as number)) > 0.0001) return false;
  }
  return (
    Math.abs(a.lift.r - b.lift.r) < 0.0001 &&
    Math.abs(a.lift.g - b.lift.g) < 0.0001 &&
    Math.abs(a.lift.b - b.lift.b) < 0.0001 &&
    Math.abs(a.gamma.r - b.gamma.r) < 0.0001 &&
    Math.abs(a.gamma.g - b.gamma.g) < 0.0001 &&
    Math.abs(a.gamma.b - b.gamma.b) < 0.0001 &&
    Math.abs(a.gain.r - b.gain.r) < 0.0001 &&
    Math.abs(a.gain.g - b.gain.g) < 0.0001 &&
    Math.abs(a.gain.b - b.gain.b) < 0.0001
  );
}

// Slider gradient styles for visual context
const sliderGradients: Record<string, string> = {
  temperature: 'linear-gradient(to right, #3b82f6, #f59e0b)',
  tint: 'linear-gradient(to right, #22c55e, #ec4899)',
  saturation: 'linear-gradient(to right, #6b7280, #f43f5e)',
};

export default function ColorPanel({
  colorGrade,
  onColorGradeChange,
  onColorSettingsChange,
  settings,
  lutThumbnails,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  disabled,
}: ColorPanelProps) {
  const selectedLUT = CINEMATIC_LUTS.find(l => l.id === colorGrade);

  const [customSettings, setCustomSettings] = useState<FullColorSettings | null>(settings ?? null);

  // Sync external state (undo/redo) back into the panel
  useEffect(() => {
    if (settings) {
      setCustomSettings(settings);
    }
  }, [settings]);

  // Reset custom settings when LUT changes
  useEffect(() => {
    setCustomSettings(null);
    if (selectedLUT && onColorSettingsChange) {
      onColorSettingsChange(getLUTDefaults(selectedLUT));
    }
  }, [colorGrade, onColorSettingsChange, selectedLUT]);

  const currentSettings: FullColorSettings | null = selectedLUT
    ? settings ?? customSettings ?? getLUTDefaults(selectedLUT)
    : null;

  const isCustomized =
    !!currentSettings &&
    !!selectedLUT &&
    !areSettingsEqual(currentSettings, getLUTDefaults(selectedLUT));

  const handleSliderChange = (key: keyof FullColorSettings, value: number) => {
    if (!selectedLUT) return;
    const base = currentSettings ?? getLUTDefaults(selectedLUT);
    const updated = { ...base, [key]: value };
    setCustomSettings(updated);
    onColorSettingsChange?.(updated);
  };

  const handleWheelChange = (key: 'lift' | 'gamma' | 'gain', value: { r: number; g: number; b: number }) => {
    if (!selectedLUT) return;
    const base = currentSettings ?? getLUTDefaults(selectedLUT);
    const updated = { ...base, [key]: value };
    setCustomSettings(updated);
    onColorSettingsChange?.(updated);
  };

  const handleResetSlider = (key: keyof FullColorSettings) => {
    if (!selectedLUT) return;
    const defaults = getLUTDefaults(selectedLUT);
    const updated = { ...(currentSettings ?? defaults), [key]: defaults[key] };
    setCustomSettings(updated);
    onColorSettingsChange?.(updated);
  };

  const handleResetToLUT = () => {
    if (!selectedLUT) return;
    setCustomSettings(null);
    onColorSettingsChange?.(getLUTDefaults(selectedLUT));
  };

  const categories = ['hollywood', 'film_stock', 'stylized', 'music_video', 'broadcast', 'documentary'] as const;

  const renderLUTCard = (lut: CinematicLUT) => {
    const active = colorGrade === lut.id;
    // Prefer live thumbnail from video, fall back to static
    const liveThumbnail = lutThumbnails?.get(lut.id);
    const thumbnail = liveThumbnail || thumbnailMap[lut.thumbnail];

    return (
      <button
        key={lut.id}
        onClick={() => !disabled && onColorGradeChange(lut.id)}
        disabled={disabled}
        className={cn(
          'group relative rounded-xl overflow-hidden border-2 transition-all duration-200',
          active
            ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
            : 'border-transparent hover:border-primary/40 hover:scale-[1.01]'
        )}
      >
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={lut.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted/30 animate-pulse" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {liveThumbnail && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-[7px] bg-black/50 text-white border-0 backdrop-blur-sm px-1 py-0">
                LIVE
              </Badge>
            </div>
          )}

          {/* Active indicator */}
          {active && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          )}

          {/* LUT name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <p className={cn(
              'text-xs font-bold text-white',
              active && 'text-primary-foreground'
            )}>
              {lut.name}
            </p>
            <p className="text-[9px] text-white/70 line-clamp-1 mt-0.5">
              {lut.description}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="p-2 bg-card flex flex-wrap gap-1">
          {lut.tags.slice(0, 3).map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[8px] px-1.5 py-0 h-4 bg-muted/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </button>
    );
  };

  const sliderDefs = [
    { key: 'contrast' as const, label: 'Contrast', range: [0.5, 2] as [number, number], step: 0.05 },
    { key: 'saturation' as const, label: 'Saturation', range: [0, 2] as [number, number], step: 0.05 },
    { key: 'temperature' as const, label: 'Temperature', range: [-50, 50] as [number, number], step: 1 },
    { key: 'tint' as const, label: 'Tint', range: [-50, 50] as [number, number], step: 1 },
    { key: 'shadows' as const, label: 'Shadows', range: [-50, 50] as [number, number], step: 1 },
    { key: 'highlights' as const, label: 'Highlights', range: [-50, 50] as [number, number], step: 1 },
  ];

  return (
    <div className="space-y-4">
      {/* LUT Library */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span className="panel-title">Cinematic LUT Library</span>
            <InsightTooltip hint={FEATURE_TOOLTIPS['color-lut']} side="right">
              <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
            </InsightTooltip>
          </div>
          <Badge variant="outline" className="text-[9px]">
            {CINEMATIC_LUTS.length} Professional LUTs
          </Badge>
        </div>

        <Tabs defaultValue="hollywood" className="w-full">
          <div className="px-2 sm:px-3 pt-2 sm:pt-3 overflow-x-auto scrollbar-hide">
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/30 p-1">
              {categories.map(cat => {
                const Icon = categoryIcons[cat];
                const count = CINEMATIC_LUTS.filter(l => l.category === cat).length;
                return (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="flex-1 min-w-[60px] sm:min-w-[80px] gap-1 text-[10px] px-1.5 sm:px-2 py-2 sm:py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{categoryLabels[cat]}</span>
                    <span className="text-[8px] opacity-70">({count})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <ScrollArea className="h-[280px] sm:h-[320px]">
            {categories.map(cat => (
              <TabsContent key={cat} value={cat} className="m-0 p-3">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {CINEMATIC_LUTS.filter(l => l.category === cat).map(renderLUTCard)}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </div>

      {/* Selected LUT Settings */}
      {selectedLUT && currentSettings && (
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="panel-title">LUT Parameters</span>
              <InsightTooltip hint={FEATURE_TOOLTIPS['color-wheels']} side="right">
                <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
              </InsightTooltip>
              {isCustomized && (
                <Badge variant="outline" className="text-[8px] bg-accent/10 border-accent/30 text-accent">
                  Customized
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Undo/Redo */}
              {(canUndo || canRedo) && (
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={onUndo}
                    disabled={!canUndo || disabled}
                    title="Undo (Ctrl+Z)"
                  >
                    <Undo2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={onRedo}
                    disabled={!canRedo || disabled}
                    title="Redo (Ctrl+Shift+Z)"
                  >
                    <Redo2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {isCustomized && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[9px] gap-1 text-muted-foreground hover:text-foreground"
                  onClick={handleResetToLUT}
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              )}
              <span className="text-[9px] text-muted-foreground font-mono">{selectedLUT.lut}</span>
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-3">
            {/* Interactive color wheels */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              <ColorWheel
                label="Lift"
                value={currentSettings.lift}
                onChange={(v) => handleWheelChange('lift', v)}
                size={72}
                disabled={disabled}
              />
              <ColorWheel
                label="Gamma"
                value={currentSettings.gamma}
                onChange={(v) => handleWheelChange('gamma', v)}
                size={72}
                disabled={disabled}
                centerValue={1}
              />
              <ColorWheel
                label="Gain"
                value={currentSettings.gain}
                onChange={(v) => handleWheelChange('gain', v)}
                size={72}
                disabled={disabled}
                centerValue={1}
              />
            </div>

            {/* Sliders with visual enhancements */}
            {sliderDefs.map((setting) => {
              const value = currentSettings[setting.key] as number;
              const lutDefault = getLUTDefaults(selectedLUT)[setting.key] as number;
              const isModified = customSettings !== null && value !== lutDefault;
              const gradient = sliderGradients[setting.key];
              return (
                <div key={setting.key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-wider cursor-pointer select-none",
                        isModified ? "text-accent font-semibold" : "text-muted-foreground"
                      )}
                      onDoubleClick={() => handleResetSlider(setting.key)}
                      title="Double-click to reset"
                    >
                      {setting.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded cursor-pointer select-none",
                        isModified ? "text-accent bg-accent/10" : "text-foreground bg-muted/50"
                      )}
                      onDoubleClick={() => handleResetSlider(setting.key)}
                      title="Double-click to reset"
                    >
                      {typeof value === 'number' && value > 0 ? `+${value}` : value}
                    </span>
                  </div>
                  <div className="relative">
                    {gradient && (
                      <div
                        className="absolute inset-0 rounded-full opacity-20 pointer-events-none"
                        style={{ background: gradient, height: '4px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                    )}
                    <Slider
                      value={[value]}
                      min={setting.range[0]}
                      max={setting.range[1]}
                      step={setting.step}
                      onValueChange={([v]) => handleSliderChange(setting.key, v)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
