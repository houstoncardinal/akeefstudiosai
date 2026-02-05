import { useState, useMemo } from 'react';
import { MOTION_EFFECTS, type MotionEffect } from '@/lib/advancedPresets';
import { cn } from '@/lib/utils';
import { 
  Zap, Film, Camera, Gauge, Eye, Palette,
  Search, HelpCircle, Check, Music
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InsightTooltip from './InsightTooltip';

interface MotionEffectsPanelProps {
  selectedEffects: string[];
  onEffectsChange: (effects: string[]) => void;
  disabled?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  zoom: Zap,
  shake: Gauge,
  speed: Gauge,
  stabilize: Eye,
  lens: Camera,
  film: Film,
  color_fx: Palette,
};

const categoryLabels: Record<string, string> = {
  zoom: 'Zoom',
  shake: 'Shake',
  speed: 'Speed',
  stabilize: 'Stabilize',
  lens: 'Lens',
  film: 'Film',
  color_fx: 'Color FX',
};

const intensityColors: Record<string, string> = {
  subtle: 'bg-success/20 text-success',
  moderate: 'bg-warning/20 text-warning',
  intense: 'bg-destructive/20 text-destructive',
};

export default function MotionEffectsPanel({
  selectedEffects,
  onEffectsChange,
  disabled,
}: MotionEffectsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(MOTION_EFFECTS.map(e => e.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredEffects = useMemo(() => {
    return MOTION_EFFECTS.filter(e => {
      const matchesSearch = searchQuery === '' || 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.useCase.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const toggleEffect = (id: string) => {
    if (disabled) return;
    if (selectedEffects.includes(id)) {
      onEffectsChange(selectedEffects.filter(e => e !== id));
    } else {
      onEffectsChange([...selectedEffects, id]);
    }
  };

  const renderEffectCard = (effect: MotionEffect) => {
    const Icon = categoryIcons[effect.category] || Zap;
    const isSelected = selectedEffects.includes(effect.id);

    return (
      <button
        key={effect.id}
        onClick={() => toggleEffect(effect.id)}
        disabled={disabled}
        className={cn(
          'w-full text-left p-3 rounded-lg border transition-all relative',
          isSelected
            ? 'bg-accent/10 border-accent/50 ring-1 ring-accent/30'
            : 'bg-muted/30 border-border/30 hover:border-border/50 hover:bg-muted/50'
        )}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            isSelected ? 'bg-accent/20' : 'bg-muted/50'
          )}>
            <Icon className={cn('w-4 h-4', isSelected ? 'text-accent' : 'text-muted-foreground')} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-medium', isSelected && 'text-accent')}>
                {effect.name}
              </span>
              {effect.beatSync && (
                <span className="text-primary" aria-label="Beat-syncable"><Music className="w-3 h-3" /></span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground line-clamp-1">
              {effect.description}
            </p>
            <p className="text-[8px] text-primary/70 mt-1">
              {effect.useCase}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge 
                variant="secondary" 
                className={cn('text-[7px] px-1.5 py-0', intensityColors[effect.intensity])}
              >
                {effect.intensity}
              </Badge>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="panel-title">Motion Effects</span>
        <InsightTooltip 
            hint={{ 
              id: 'motion-effects',
              title: 'Motion Effects', 
              description: 'Apply professional motion effects including zoom pulses, camera shakes, speed ramps, lens effects, and film emulation. Perfect for adding energy and style.' 
            }} 
            side="right"
          >
            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
          </InsightTooltip>
        </div>
        <Badge variant="outline" className="text-[9px]">
          {selectedEffects.length} Active
        </Badge>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="px-3 pt-2 overflow-x-auto scrollbar-hide">
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/30 p-1">
            <TabsTrigger
              value="all"
              className="flex-1 min-w-[50px] gap-1 text-[9px] px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All
              <span className="text-[7px] opacity-70">({MOTION_EFFECTS.length})</span>
            </TabsTrigger>
            {categories.filter(c => c !== 'all').map(cat => {
              const Icon = categoryIcons[cat] || Zap;
              const count = MOTION_EFFECTS.filter(e => e.category === cat).length;
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="flex-1 min-w-[50px] gap-1 text-[9px] px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden lg:inline">{categoryLabels[cat] || cat}</span>
                  <span className="text-[7px] opacity-70">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <ScrollArea className="h-[300px]">
          <TabsContent value={activeCategory} className="m-0 p-3">
            <div className="grid grid-cols-1 gap-2">
              {filteredEffects.map(renderEffectCard)}
            </div>
            {filteredEffects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No effects found</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
