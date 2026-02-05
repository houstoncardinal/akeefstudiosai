import { useState, useMemo } from 'react';
import { 
  TRANSITION_LIBRARY, 
  getTransitionsByCategory, 
  getBeatSyncTransitions,
  type TransitionPreset 
} from '@/lib/presets';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';
import { 
  Scissors, 
  Blend, 
  ArrowRightLeft, 
  Move3D, 
  Sparkles, 
  Zap, 
  Sun, 
  Layers,
  Plus,
  Trash2,
  Settings2,
  Clock,
  Music,
  Search,
  Check,
  ChevronDown,
  Wand2,
  Grid3X3,
  HelpCircle
} from 'lucide-react';

interface TransitionsPanelProps {
  selectedTransitions: string[];
  onTransitionsChange: (transitions: string[]) => void;
  disabled?: boolean;
}

interface TimelineTransition {
  id: string;
  transitionId: string;
  position: number; // position in timeline (0-based index)
  duration: number; // custom duration override
  parameters: Record<string, number>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  cut: <Scissors className="w-4 h-4" />,
  dissolve: <Blend className="w-4 h-4" />,
  wipe: <ArrowRightLeft className="w-4 h-4" />,
  motion: <Move3D className="w-4 h-4" />,
  stylized: <Sparkles className="w-4 h-4" />,
  glitch: <Zap className="w-4 h-4" />,
  light: <Sun className="w-4 h-4" />,
  morph: <Layers className="w-4 h-4" />,
};

const categoryNames: Record<string, string> = {
  cut: 'Cuts',
  dissolve: 'Dissolves',
  wipe: 'Wipes',
  motion: 'Motion',
  stylized: 'Stylized',
  glitch: 'Glitch',
  light: 'Light',
  morph: 'Morph',
};

const intensityColors: Record<string, string> = {
  subtle: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  intense: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function TransitionsPanel({ 
  selectedTransitions, 
  onTransitionsChange, 
  disabled 
}: TransitionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showBeatSyncOnly, setShowBeatSyncOnly] = useState(false);
  const [editingTransition, setEditingTransition] = useState<TransitionPreset | null>(null);
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});
  const [customParams, setCustomParams] = useState<Record<string, Record<string, number>>>({});

  const categories = useMemo(() => {
    const cats = Array.from(new Set(TRANSITION_LIBRARY.map(t => t.category)));
    return ['all', ...cats];
  }, []);

  const filteredTransitions = useMemo(() => {
    let transitions = TRANSITION_LIBRARY;
    
    if (activeCategory !== 'all') {
      transitions = getTransitionsByCategory(activeCategory as TransitionPreset['category']);
    }
    
    if (showBeatSyncOnly) {
      transitions = transitions.filter(t => t.beatSync);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      transitions = transitions.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.includes(query))
      );
    }
    
    return transitions;
  }, [activeCategory, showBeatSyncOnly, searchQuery]);

  const handleToggleTransition = (transitionId: string) => {
    if (disabled) return;
    
    if (selectedTransitions.includes(transitionId)) {
      onTransitionsChange(selectedTransitions.filter(id => id !== transitionId));
    } else {
      onTransitionsChange([...selectedTransitions, transitionId]);
    }
  };

  const handleDurationChange = (transitionId: string, duration: number) => {
    setCustomDurations(prev => ({ ...prev, [transitionId]: duration }));
  };

  const handleParamChange = (transitionId: string, paramName: string, value: number) => {
    setCustomParams(prev => ({
      ...prev,
      [transitionId]: {
        ...(prev[transitionId] || {}),
        [paramName]: value,
      },
    }));
  };

  const getTransitionDuration = (t: TransitionPreset) => {
    return customDurations[t.id] ?? t.duration;
  };

  const framesToTime = (frames: number) => {
    const seconds = frames / 24;
    if (seconds < 1) return `${Math.round(frames)}f`;
    return `${seconds.toFixed(1)}s`;
  };

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Transitions Library</span>
            <InsightTooltip hint={FEATURE_TOOLTIPS['transitions-sync']} side="right">
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
            </InsightTooltip>
          </div>
          <Badge variant="outline" className="text-[9px]">
            {selectedTransitions.length} selected
          </Badge>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-muted/30"
              disabled={disabled}
            />
          </div>
          
          {/* Beat Sync Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Beat-Syncable Only</span>
            </div>
            <Switch
              checked={showBeatSyncOnly}
              onCheckedChange={setShowBeatSyncOnly}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-card/50 p-1.5">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              disabled={disabled}
              className="text-[10px] px-3 py-1.5 gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat === 'all' ? (
                <Grid3X3 className="w-3 h-3" />
              ) : (
                categoryIcons[cat]
              )}
              {cat === 'all' ? 'All' : categoryNames[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          <ScrollArea className="h-[420px]">
            <div className="grid grid-cols-2 gap-2 pr-4">
              {filteredTransitions.map((transition) => {
                const isSelected = selectedTransitions.includes(transition.id);
                const duration = getTransitionDuration(transition);
                
                return (
                  <div
                    key={transition.id}
                    className={cn(
                      'preset-card p-3 cursor-pointer transition-all duration-200 group',
                      isSelected && 'active ring-1 ring-primary/50',
                      disabled && 'opacity-50 pointer-events-none'
                    )}
                    onClick={() => handleToggleTransition(transition.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center border transition-colors',
                          isSelected 
                            ? 'bg-primary/20 border-primary/40 text-primary' 
                            : 'bg-muted/30 border-border/50 text-muted-foreground'
                        )}>
                          {categoryIcons[transition.category]}
                        </div>
                        <div>
                          <p className={cn(
                            'text-xs font-semibold',
                            isSelected && 'text-primary'
                          )}>
                            {transition.name}
                          </p>
                          <p className="text-[9px] text-muted-foreground line-clamp-1">
                            {transition.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Duration */}
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0 gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {framesToTime(duration)}
                      </Badge>
                      
                      {/* Intensity */}
                      <Badge 
                        variant="outline" 
                        className={cn('text-[8px] px-1.5 py-0', intensityColors[transition.intensity])}
                      >
                        {transition.intensity}
                      </Badge>
                      
                      {/* Beat Sync */}
                      {transition.beatSync && (
                        <Badge variant="outline" className="text-[8px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                          <Music className="w-2.5 h-2.5 mr-0.5" />
                          Sync
                        </Badge>
                      )}
                    </div>

                    {/* Edit button (appears on hover when selected) */}
                    {isSelected && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <InsightTooltip hint={FEATURE_TOOLTIPS['transition-params']} side="top">
                            <Button
                              variant="ghost"
                            size="sm"
                            className="w-full mt-2 h-7 text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTransition(transition);
                            }}
                          >
                            <Settings2 className="w-3 h-3" />
                              Edit Parameters
                            </Button>
                          </InsightTooltip>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {categoryIcons[transition.category]}
                              {transition.name}
                            </DialogTitle>
                            <DialogDescription>
                              Customize transition parameters
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            {/* Duration slider */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium">Duration</label>
                                <span className="text-xs text-muted-foreground font-mono">
                                  {framesToTime(getTransitionDuration(transition))}
                                </span>
                              </div>
                              <Slider
                                value={[getTransitionDuration(transition)]}
                                min={transition.minDuration}
                                max={transition.maxDuration}
                                step={1}
                                onValueChange={([val]) => handleDurationChange(transition.id, val)}
                                className="py-2"
                              />
                              <div className="flex justify-between text-[9px] text-muted-foreground">
                                <span>{framesToTime(transition.minDuration)}</span>
                                <span>{framesToTime(transition.maxDuration)}</span>
                              </div>
                            </div>

                            {/* Parameter sliders */}
                            {Object.entries(transition.parameters).map(([key, value]) => {
                              const currentValue = customParams[transition.id]?.[key] ?? value;
                              const isNumeric = typeof value === 'number';
                              
                              if (!isNumeric) return null;
                              
                              return (
                                <div key={key} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium capitalize">
                                      {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue}
                                    </span>
                                  </div>
                                  <Slider
                                    value={[currentValue as number]}
                                    min={0}
                                    max={value > 1 ? value * 2 : 1}
                                    step={value > 1 ? 1 : 0.05}
                                    onValueChange={([val]) => handleParamChange(transition.id, key, val)}
                                    className="py-2"
                                  />
                                </div>
                              );
                            })}

                            {/* Easing selector */}
                            <div className="space-y-2">
                              <label className="text-xs font-medium">Easing</label>
                              <div className="grid grid-cols-3 gap-2">
                                {['ease-in', 'ease-out', 'ease-in-out', 'linear', 'bounce', 'elastic'].map((easing) => (
                                  <Button
                                    key={easing}
                                    variant={transition.easing === easing ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-[9px] h-7"
                                  >
                                    {easing}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="panel p-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] gap-1.5"
            disabled={disabled}
            onClick={() => onTransitionsChange(getBeatSyncTransitions().map(t => t.id))}
          >
            <Music className="w-3 h-3" />
            Beat-Sync Set
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] gap-1.5"
            disabled={disabled}
            onClick={() => onTransitionsChange(getTransitionsByCategory('dissolve').map(t => t.id))}
          >
            <Blend className="w-3 h-3" />
            Cinematic Set
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] gap-1.5"
            disabled={disabled}
            onClick={() => onTransitionsChange([])}
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}