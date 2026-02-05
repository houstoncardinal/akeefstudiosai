import { useState, useEffect } from 'react';
import { CINEMATIC_LUTS, type CinematicLUT } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { 
  Layers, 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff, 
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  FolderOpen,
  Star,
  Blend,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type FullColorSettings } from '@/lib/webgl/WebGLRenderer';

// Blend modes for color grading
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft_light' | 'hard_light';

export const BLEND_MODES: { id: BlendMode; name: string; description: string }[] = [
  { id: 'normal', name: 'Normal', description: 'Standard opacity blend' },
  { id: 'multiply', name: 'Multiply', description: 'Darkens the image' },
  { id: 'screen', name: 'Screen', description: 'Lightens the image' },
  { id: 'overlay', name: 'Overlay', description: 'Increases contrast' },
  { id: 'soft_light', name: 'Soft Light', description: 'Subtle contrast boost' },
  { id: 'hard_light', name: 'Hard Light', description: 'Strong contrast boost' },
];

export interface StackedLUT {
  id: string;
  lutId: string;
  opacity: number;
  enabled: boolean;
  blendMode: BlendMode;
}

export interface LUTStackPreset {
  id: string;
  name: string;
  stack: StackedLUT[];
  createdAt: string;
  isFavorite?: boolean;
}

interface LUTStackPanelProps {
  stack: StackedLUT[];
  onStackChange: (stack: StackedLUT[]) => void;
  onBlendedSettingsChange: (settings: FullColorSettings) => void;
  disabled?: boolean;
}

const PRESETS_STORAGE_KEY = 'akeef_lut_stack_presets';

// Apply blend mode to a value
function applyBlendMode(base: number, value: number, mode: BlendMode, opacity: number): number {
  const t = opacity / 100;
  
  switch (mode) {
    case 'multiply':
      return base + (base * value - base) * t;
    case 'screen':
      return base + (base + value - base * value - base) * t;
    case 'overlay':
      if (base < 0.5) {
        return base + (2 * base * value - base) * t;
      }
      return base + (2 * (base + value - base * value) - 1 - base) * t;
    case 'soft_light':
      if (value < 0.5) {
        return base + (base - (1 - 2 * value) * base * (1 - base) - base) * t;
      }
      return base + ((1 + (2 * value - 1) * (Math.sqrt(base) - base)) * base - base) * t;
    case 'hard_light':
      if (value < 0.5) {
        return base + (2 * base * value - base) * t;
      }
      return base + (2 * (base + value - base * value) - 1 - base) * t;
    case 'normal':
    default:
      return base + (value - base) * t;
  }
}

// Blend multiple LUT settings together based on opacity and blend mode
export function blendLUTSettings(stack: StackedLUT[]): FullColorSettings {
  const enabledLuts = stack.filter(s => s.enabled && s.opacity > 0);
  
  // Neutral base settings
  const neutral: FullColorSettings = {
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
  
  if (enabledLuts.length === 0) {
    return neutral;
  }

  // Apply each LUT layer with its blend mode
  let result = { ...neutral };

  for (const stackedLut of enabledLuts) {
    const lut = CINEMATIC_LUTS.find(l => l.id === stackedLut.lutId);
    if (!lut) continue;

    const mode = stackedLut.blendMode || 'normal';
    const opacity = stackedLut.opacity;

    // For multiplicative values (contrast, saturation), normalize around 1
    result.contrast = applyBlendMode(result.contrast, lut.settings.contrast, mode, opacity);
    result.saturation = applyBlendMode(result.saturation, lut.settings.saturation, mode, opacity);
    
    // For additive values, use direct blend
    result.temperature = result.temperature + (lut.settings.temperature - 0) * (opacity / 100);
    result.tint = result.tint + (lut.settings.tint - 0) * (opacity / 100);
    result.shadows = result.shadows + (lut.settings.shadows - 0) * (opacity / 100);
    result.highlights = result.highlights + (lut.settings.highlights - 0) * (opacity / 100);
    
    // Lift/Gamma/Gain
    result.lift.r = applyBlendMode(result.lift.r, lut.settings.lift, mode, opacity);
    result.lift.g = applyBlendMode(result.lift.g, lut.settings.lift, mode, opacity);
    result.lift.b = applyBlendMode(result.lift.b, lut.settings.lift, mode, opacity);
    
    result.gamma.r = applyBlendMode(result.gamma.r, lut.settings.gamma, mode, opacity);
    result.gamma.g = applyBlendMode(result.gamma.g, lut.settings.gamma, mode, opacity);
    result.gamma.b = applyBlendMode(result.gamma.b, lut.settings.gamma, mode, opacity);
    
    result.gain.r = applyBlendMode(result.gain.r, lut.settings.gain, mode, opacity);
    result.gain.g = applyBlendMode(result.gain.g, lut.settings.gain, mode, opacity);
    result.gain.b = applyBlendMode(result.gain.b, lut.settings.gain, mode, opacity);
  }

  return result;
}

export default function LUTStackPanel({
  stack,
  onStackChange,
  onBlendedSettingsChange,
  disabled,
}: LUTStackPanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [presets, setPresets] = useState<LUTStackPreset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Load presets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (stored) {
      try {
        setPresets(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load LUT stack presets:', e);
      }
    }
  }, []);

  // Save presets to localStorage
  const savePresetsToStorage = (newPresets: LUTStackPreset[]) => {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
    setPresets(newPresets);
  };

  const handleAddLUT = (lutId: string) => {
    const newStack: StackedLUT[] = [
      ...stack,
      {
        id: `${lutId}-${Date.now()}`,
        lutId,
        opacity: 100,
        enabled: true,
        blendMode: 'normal',
      },
    ];
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
    setIsAddOpen(false);
  };

  const handleRemoveLUT = (id: string) => {
    const newStack = stack.filter(s => s.id !== id);
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
  };

  const handleToggleEnabled = (id: string) => {
    const newStack = stack.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
  };

  const handleOpacityChange = (id: string, opacity: number) => {
    const newStack = stack.map(s =>
      s.id === id ? { ...s, opacity } : s
    );
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
  };

  const handleBlendModeChange = (id: string, blendMode: BlendMode) => {
    const newStack = stack.map(s =>
      s.id === id ? { ...s, blendMode } : s
    );
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newStack = [...stack];
    [newStack[index - 1], newStack[index]] = [newStack[index], newStack[index - 1]];
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
  };

  const handleMoveDown = (index: number) => {
    if (index === stack.length - 1) return;
    const newStack = [...stack];
    [newStack[index], newStack[index + 1]] = [newStack[index + 1], newStack[index]];
    onStackChange(newStack);
    onBlendedSettingsChange(blendLUTSettings(newStack));
  };

  const handleClearStack = () => {
    onStackChange([]);
    onBlendedSettingsChange(blendLUTSettings([]));
  };

  // Preset management
  const handleSavePreset = () => {
    if (!newPresetName.trim() || stack.length === 0) return;
    
    const newPreset: LUTStackPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      stack: [...stack],
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    
    savePresetsToStorage([...presets, newPreset]);
    setNewPresetName('');
    setSaveDialogOpen(false);
  };

  const handleLoadPreset = (preset: LUTStackPreset) => {
    // Regenerate IDs to avoid conflicts
    const loadedStack = preset.stack.map(s => ({
      ...s,
      id: `${s.lutId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    onStackChange(loadedStack);
    onBlendedSettingsChange(blendLUTSettings(loadedStack));
    setLoadDialogOpen(false);
  };

  const handleDeletePreset = (presetId: string) => {
    savePresetsToStorage(presets.filter(p => p.id !== presetId));
  };

  const handleToggleFavorite = (presetId: string) => {
    savePresetsToStorage(
      presets.map(p =>
        p.id === presetId ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
  };

  // Get LUTs not already in stack for the add menu
  const availableLuts = CINEMATIC_LUTS.filter(
    lut => !stack.some(s => s.lutId === lut.id)
  );

  // Group available LUTs by category
  const lutsByCategory = availableLuts.reduce((acc, lut) => {
    if (!acc[lut.category]) acc[lut.category] = [];
    acc[lut.category].push(lut);
    return acc;
  }, {} as Record<string, CinematicLUT[]>);

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

  // Sort presets: favorites first, then by date
  const sortedPresets = [...presets].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="panel-title">LUT Stack</span>
          <Badge variant="outline" className="text-[9px]">
            {stack.filter(s => s.enabled).length} Active
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {/* Load Preset */}
          <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={disabled || presets.length === 0}
                title="Load preset"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Load LUT Stack Preset</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {sortedPresets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No saved presets yet
                    </p>
                  ) : (
                    sortedPresets.map(preset => (
                      <div
                        key={preset.id}
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <button
                          onClick={() => handleToggleFavorite(preset.id)}
                          className="p-1"
                        >
                          <Star
                            className={cn(
                              'w-3.5 h-3.5',
                              preset.isFavorite
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-muted-foreground'
                            )}
                          />
                        </button>
                        <button
                          onClick={() => handleLoadPreset(preset)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm font-medium">{preset.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {preset.stack.length} LUTs
                          </p>
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="p-1 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Save Preset */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={disabled || stack.length === 0}
                title="Save as preset"
              >
                <Save className="w-3.5 h-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Save LUT Stack Preset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preset Name</label>
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g., Cinematic Sunset"
                    className="h-9"
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">
                  This will save {stack.length} LUT{stack.length !== 1 ? 's' : ''} with their opacity and blend mode settings.
                </div>
                <Button
                  onClick={handleSavePreset}
                  disabled={!newPresetName.trim()}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preset
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {stack.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] gap-1"
              onClick={handleClearStack}
              disabled={disabled}
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </Button>
          )}
          <Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] gap-1.5"
                disabled={disabled || availableLuts.length === 0}
              >
                <Plus className="w-3.5 h-3.5" />
                Add LUT
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-2">
                  {Object.entries(lutsByCategory).map(([category, luts]) => (
                    <div key={category}>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                        {categoryLabels[category] || category}
                      </p>
                      <div className="space-y-0.5">
                        {luts.map(lut => (
                          <button
                            key={lut.id}
                            onClick={() => handleAddLUT(lut.id)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-muted/50 transition-colors"
                          >
                            <p className="text-xs font-medium">{lut.name}</p>
                            <p className="text-[9px] text-muted-foreground truncate">
                              {lut.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {stack.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">No LUTs in stack</p>
            <p className="text-[10px] mt-1">Add LUTs to blend them together</p>
            {presets.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-7 text-[10px]"
                onClick={() => setLoadDialogOpen(true)}
              >
                <FolderOpen className="w-3 h-3 mr-1.5" />
                Load Preset
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            {stack.map((stackedLut, index) => {
              const lut = CINEMATIC_LUTS.find(l => l.id === stackedLut.lutId);
              if (!lut) return null;
              
              const isExpanded = expandedId === stackedLut.id;
              const blendModeInfo = BLEND_MODES.find(m => m.id === stackedLut.blendMode);

              return (
                <div
                  key={stackedLut.id}
                  className={cn(
                    'rounded-lg border transition-all',
                    stackedLut.enabled
                      ? 'border-border bg-card'
                      : 'border-border/50 bg-muted/30 opacity-60'
                  )}
                >
                  {/* Header row */}
                  <div className="flex items-center gap-2 p-2">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 cursor-grab" />
                    
                    <button
                      onClick={() => handleToggleEnabled(stackedLut.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      disabled={disabled}
                    >
                      {stackedLut.enabled ? (
                        <Eye className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{lut.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {blendModeInfo?.name || 'Normal'} · {Math.round(stackedLut.opacity)}%
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : stackedLut.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>

                    <button
                      onClick={() => handleRemoveLUT(stackedLut.id)}
                      className="p-1 hover:bg-destructive/20 rounded transition-colors text-muted-foreground hover:text-destructive"
                      disabled={disabled}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-2">
                      {/* Blend Mode */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Blend className="w-3 h-3" />
                            Blend Mode
                          </span>
                        </div>
                        <Select
                          value={stackedLut.blendMode}
                          onValueChange={(v) => handleBlendModeChange(stackedLut.id, v as BlendMode)}
                          disabled={disabled || !stackedLut.enabled}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BLEND_MODES.map(mode => (
                              <SelectItem key={mode.id} value={mode.id}>
                                <div>
                                  <span className="font-medium">{mode.name}</span>
                                  <span className="text-muted-foreground ml-2 text-[10px]">
                                    {mode.description}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Opacity slider */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Opacity
                          </span>
                          <span className="text-[10px] font-mono text-foreground">
                            {Math.round(stackedLut.opacity)}%
                          </span>
                        </div>
                        <Slider
                          value={[stackedLut.opacity]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={([v]) => handleOpacityChange(stackedLut.id, v)}
                          disabled={disabled || !stackedLut.enabled}
                        />
                      </div>

                      {/* Reorder buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[9px] flex-1"
                          onClick={() => handleMoveUp(index)}
                          disabled={disabled || index === 0}
                        >
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Move Up
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[9px] flex-1"
                          onClick={() => handleMoveDown(index)}
                          disabled={disabled || index === stack.length - 1}
                        >
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Move Down
                        </Button>
                      </div>

                      {/* LUT info */}
                      <p className="text-[9px] text-muted-foreground">
                        {lut.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Blend preview info */}
        {stack.filter(s => s.enabled).length > 1 && (
          <div className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-primary font-medium">
                Blending {stack.filter(s => s.enabled).length} LUTs
              </span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              Layers are applied bottom-to-top with blend modes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
