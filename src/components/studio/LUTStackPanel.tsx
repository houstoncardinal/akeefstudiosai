import { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { type FullColorSettings } from '@/lib/webgl/WebGLRenderer';

export interface StackedLUT {
  id: string;
  lutId: string;
  opacity: number;
  enabled: boolean;
}

interface LUTStackPanelProps {
  stack: StackedLUT[];
  onStackChange: (stack: StackedLUT[]) => void;
  onBlendedSettingsChange: (settings: FullColorSettings) => void;
  disabled?: boolean;
}

// Blend multiple LUT settings together based on opacity
export function blendLUTSettings(stack: StackedLUT[]): FullColorSettings {
  const enabledLuts = stack.filter(s => s.enabled && s.opacity > 0);
  
  if (enabledLuts.length === 0) {
    // Return neutral settings
    return {
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
  }

  // Normalize opacities to sum to 1
  const totalOpacity = enabledLuts.reduce((sum, s) => sum + s.opacity, 0);
  
  const blended: FullColorSettings = {
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    shadows: 0,
    highlights: 0,
    lift: { r: 0, g: 0, b: 0 },
    gamma: { r: 0, g: 0, b: 0 },
    gain: { r: 0, g: 0, b: 0 },
  };

  for (const stackedLut of enabledLuts) {
    const lut = CINEMATIC_LUTS.find(l => l.id === stackedLut.lutId);
    if (!lut) continue;

    const weight = stackedLut.opacity / totalOpacity;
    
    blended.contrast += lut.settings.contrast * weight;
    blended.saturation += lut.settings.saturation * weight;
    blended.temperature += lut.settings.temperature * weight;
    blended.tint += lut.settings.tint * weight;
    blended.shadows += lut.settings.shadows * weight;
    blended.highlights += lut.settings.highlights * weight;
    
    blended.lift.r += lut.settings.lift * weight;
    blended.lift.g += lut.settings.lift * weight;
    blended.lift.b += lut.settings.lift * weight;
    
    blended.gamma.r += lut.settings.gamma * weight;
    blended.gamma.g += lut.settings.gamma * weight;
    blended.gamma.b += lut.settings.gamma * weight;
    
    blended.gain.r += lut.settings.gain * weight;
    blended.gain.g += lut.settings.gain * weight;
    blended.gain.b += lut.settings.gain * weight;
  }

  return blended;
}

export default function LUTStackPanel({
  stack,
  onStackChange,
  onBlendedSettingsChange,
  disabled,
}: LUTStackPanelProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAddLUT = (lutId: string) => {
    const newStack = [
      ...stack,
      {
        id: `${lutId}-${Date.now()}`,
        lutId,
        opacity: 100,
        enabled: true,
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
          </div>
        ) : (
          <div className="space-y-1.5">
            {stack.map((stackedLut, index) => {
              const lut = CINEMATIC_LUTS.find(l => l.id === stackedLut.lutId);
              if (!lut) return null;
              
              const isExpanded = expandedId === stackedLut.id;

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
                    </div>

                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-[9px] px-1.5 min-w-[40px] justify-center',
                        stackedLut.opacity === 100 && 'bg-primary/20 text-primary'
                      )}
                    >
                      {Math.round(stackedLut.opacity)}%
                    </Badge>

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
              Settings are weighted by opacity values
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
