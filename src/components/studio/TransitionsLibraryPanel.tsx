import { useState, useMemo } from 'react';
import { TRANSITIONS_LIBRARY, type Transition } from '@/lib/advancedPresets';
import { cn } from '@/lib/utils';
import { 
  Scissors, Zap, Sparkles, Move, Sun, Palette, 
  Search, Filter, Music, HelpCircle, Check
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InsightTooltip from './InsightTooltip';

interface TransitionsLibraryPanelProps {
  selectedTransitions: string[];
  onTransitionsChange: (transitions: string[]) => void;
  disabled?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  cut: Scissors,
  dissolve: Sparkles,
  wipe: Move,
  zoom: Zap,
  glitch: Zap,
  creative: Palette,
  motion: Move,
  light: Sun,
};

const categoryLabels: Record<string, string> = {
  cut: 'Cuts',
  dissolve: 'Dissolves',
  wipe: 'Wipes',
  zoom: 'Zoom',
  glitch: 'Glitch',
  creative: 'Creative',
  motion: 'Motion',
  light: 'Light',
};

const intensityColors: Record<string, string> = {
  subtle: 'bg-success/20 text-success',
  moderate: 'bg-warning/20 text-warning',
  intense: 'bg-destructive/20 text-destructive',
};

export default function TransitionsLibraryPanel({
  selectedTransitions,
  onTransitionsChange,
  disabled,
}: TransitionsLibraryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(TRANSITIONS_LIBRARY.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredTransitions = useMemo(() => {
    return TRANSITIONS_LIBRARY.filter(t => {
      const matchesSearch = searchQuery === '' || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const toggleTransition = (id: string) => {
    if (disabled) return;
    if (selectedTransitions.includes(id)) {
      onTransitionsChange(selectedTransitions.filter(t => t !== id));
    } else {
      onTransitionsChange([...selectedTransitions, id]);
    }
  };

  const renderTransitionCard = (transition: Transition) => {
    const Icon = categoryIcons[transition.category] || Sparkles;
    const isSelected = selectedTransitions.includes(transition.id);

    return (
      <button
        key={transition.id}
        onClick={() => toggleTransition(transition.id)}
        disabled={disabled}
        className={cn(
          'w-full text-left p-3 rounded-lg border transition-all relative',
          isSelected
            ? 'bg-primary/10 border-primary/50 ring-1 ring-primary/30'
            : 'bg-muted/30 border-border/30 hover:border-border/50 hover:bg-muted/50'
        )}
      >
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            isSelected ? 'bg-primary/20' : 'bg-muted/50'
          )}>
            <Icon className={cn('w-4 h-4', isSelected ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-medium', isSelected && 'text-primary')}>
                {transition.name}
              </span>
              {transition.beatSync && (
                <span className="text-accent" aria-label="Beat-syncable"><Music className="w-3 h-3" /></span>
              )}
            </div>
            <p className="text-[9px] text-muted-foreground line-clamp-2">
              {transition.description}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge 
                variant="secondary" 
                className={cn('text-[7px] px-1.5 py-0', intensityColors[transition.intensity])}
              >
                {transition.intensity}
              </Badge>
              <span className="text-[8px] text-muted-foreground font-mono">
                {transition.duration}f
              </span>
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
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="panel-title">Transitions Library</span>
        <InsightTooltip 
            hint={{ 
              id: 'transitions-library',
              title: 'Transitions Library', 
              description: 'Browse 50+ professional transitions including cuts, dissolves, wipes, zooms, glitches, and creative effects. Click to add to your edit.' 
            }} 
            side="right"
          >
            <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
          </InsightTooltip>
        </div>
        <Badge variant="outline" className="text-[9px]">
          {selectedTransitions.length} Selected
        </Badge>
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search transitions..."
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
            {categories.map(cat => {
              const Icon = cat === 'all' ? Filter : (categoryIcons[cat] || Sparkles);
              const count = cat === 'all' 
                ? TRANSITIONS_LIBRARY.length 
                : TRANSITIONS_LIBRARY.filter(t => t.category === cat).length;
              return (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="flex-1 min-w-[60px] gap-1 text-[9px] px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline capitalize">
                    {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
                  </span>
                  <span className="text-[7px] opacity-70">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <ScrollArea className="h-[350px]">
          <TabsContent value={activeCategory} className="m-0 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredTransitions.map(renderTransitionCard)}
            </div>
            {filteredTransitions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No transitions found</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
