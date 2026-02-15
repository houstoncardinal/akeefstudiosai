import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Star,
  Clock,
  Wand2,
  Palette,
  Zap,
  Clapperboard,
  Type,
  Layers,
  Wrench,
  ArrowRightLeft,
  Eye,
  Music,
  Compass,
  SlidersHorizontal,
  Sparkles,
  FolderOpen,
  Library,
  Film,
} from 'lucide-react';

interface ToolSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

interface ToolGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  sections: ToolSection[];
}

const toolGroups: ToolGroup[] = [
  {
    id: 'ai',
    label: 'AI Studio',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    sections: [
      { id: 'ai-vibe', label: 'AI Vibe Chat', icon: <Sparkles className="w-4 h-4" />, shortcut: '`' },
      { id: 'tools', label: 'AI Tools', icon: <Wrench className="w-4 h-4" /> },
      { id: 'shots', label: 'Shot Analysis', icon: <Eye className="w-4 h-4" /> },
      { id: 'beats', label: 'Beat Engine', icon: <Music className="w-4 h-4" /> },
      { id: 'intent', label: 'Director Intent', icon: <Compass className="w-4 h-4" /> },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    icon: <Library className="w-3.5 h-3.5" />,
    sections: [
      { id: 'clips', label: 'Clip Library', icon: <Library className="w-4 h-4" /> },
    ],
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: <Palette className="w-3.5 h-3.5" />,
    sections: [
      { id: 'style', label: 'Style Presets', icon: <Wand2 className="w-4 h-4" />, shortcut: '1' },
      { id: 'color', label: 'Color Grading', icon: <Palette className="w-4 h-4" />, shortcut: '2' },
      { id: 'effects', label: 'Effects', icon: <Zap className="w-4 h-4" />, shortcut: '3' },
      { id: 'motion', label: 'Motion FX', icon: <Clapperboard className="w-4 h-4" /> },
      { id: 'graphics', label: 'Graphics', icon: <Type className="w-4 h-4" /> },
      { id: 'transitions', label: 'Transitions', icon: <ArrowRightLeft className="w-4 h-4" /> },
      { id: 'transitions_lib', label: 'Trans Library', icon: <ArrowRightLeft className="w-4 h-4" /> },
    ],
  },
  {
    id: 'output',
    label: 'Output',
    icon: <Sparkles className="w-3.5 h-3.5" />,
    sections: [
      { id: 'postprod', label: 'Post-Production', icon: <Film className="w-4 h-4" /> },
      { id: 'versions', label: 'Versions', icon: <Layers className="w-4 h-4" /> },
      { id: 'advanced', label: 'Pro Settings', icon: <SlidersHorizontal className="w-4 h-4" /> },
      { id: 'export', label: 'Export', icon: <Sparkles className="w-4 h-4" />, shortcut: '4' },
      { id: 'exports', label: 'My Exports', icon: <FolderOpen className="w-4 h-4" /> },
    ],
  },
];

interface ToolRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  recentTools?: string[];
  favoriteTools?: string[];
  collapsed?: boolean;
}

export default function ToolRail({ 
  activeTab, 
  onTabChange, 
  recentTools = [],
  favoriteTools = [],
  collapsed = false 
}: ToolRailProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['ai', 'media', 'creative', 'output']);

  // Flatten all sections for search
  const allSections = useMemo(() => 
    toolGroups.flatMap(g => g.sections.map(s => ({ ...s, groupId: g.id, groupLabel: g.label }))),
    []
  );

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase();
    return allSections.filter(s => 
      s.label.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      s.groupLabel.toLowerCase().includes(query)
    );
  }, [searchQuery, allSections]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  // Collapsed mode: icon-only rail
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 w-12 bg-card/50 border border-border/40 rounded-xl p-1.5 backdrop-blur-sm">
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1">
            {allSections.map((section) => {
              const active = activeTab === section.id;
              return (
                <Tooltip key={section.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onTabChange(section.id)}
                      className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      {section.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    <span>{section.label}</span>
                    {section.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">
                        {section.shortcut}
                      </kbd>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Full expanded mode
  return (
    <div className="flex flex-col w-[180px] bg-card/50 border border-border/40 rounded-2xl backdrop-blur-sm overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-muted/30 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
        <div className="p-2 space-y-1">
          {/* Search results */}
          {filteredSections ? (
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
                {filteredSections.length} result{filteredSections.length !== 1 ? 's' : ''}
              </p>
              {filteredSections.map((section) => (
                <ToolButton
                  key={section.id}
                  section={section}
                  active={activeTab === section.id}
                  onClick={() => {
                    onTabChange(section.id);
                    setSearchQuery('');
                  }}
                />
              ))}
              {filteredSections.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No tools found
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Favorites */}
              {favoriteTools.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Star className="w-3 h-3" />
                    <span>Favorites</span>
                  </div>
                  <div className="space-y-0.5">
                    {favoriteTools.map(id => {
                      const section = allSections.find(s => s.id === id);
                      if (!section) return null;
                      return (
                        <ToolButton
                          key={section.id}
                          section={section}
                          active={activeTab === section.id}
                          onClick={() => onTabChange(section.id)}
                          compact
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent */}
              {recentTools.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Recent</span>
                  </div>
                  <div className="space-y-0.5">
                    {recentTools.slice(0, 3).map(id => {
                      const section = allSections.find(s => s.id === id);
                      if (!section) return null;
                      return (
                        <ToolButton
                          key={section.id}
                          section={section}
                          active={activeTab === section.id}
                          onClick={() => onTabChange(section.id)}
                          compact
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grouped tools */}
              {toolGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.id);
                const hasActiveTab = group.sections.some(s => s.id === activeTab);
                
                return (
                  <Collapsible 
                    key={group.id} 
                    open={isExpanded} 
                    onOpenChange={() => toggleGroup(group.id)}
                  >
                    <CollapsibleTrigger className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                      hasActiveTab 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50 text-foreground/80"
                    )}>
                      <div className="flex items-center gap-2">
                        {group.icon}
                        <span>{group.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="pl-1 mt-0.5 space-y-0.5">
                      {group.sections.map((section) => (
                        <ToolButton
                          key={section.id}
                          section={section}
                          active={activeTab === section.id}
                          onClick={() => onTabChange(section.id)}
                        />
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Keyboard hint footer */}
      <div className="p-2 border-t border-border/30">
        <p className="text-[9px] text-center text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted rounded text-[8px] font-mono">1-4</kbd> for quick access
        </p>
      </div>
    </div>
  );
}

// Tool button component
interface ToolButtonProps {
  section: ToolSection;
  active: boolean;
  onClick: () => void;
  compact?: boolean;
}

function ToolButton({ section, active, onClick, compact }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 rounded-lg text-xs font-medium transition-all',
        compact ? 'py-1.5' : 'py-2',
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      <span className={cn(
        'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all',
        active 
          ? 'bg-primary-foreground/15' 
          : 'bg-background/50'
      )}>
        {section.icon}
      </span>
      <span className="truncate flex-1 text-left">{section.label}</span>
      {section.shortcut && (
        <kbd className={cn(
          'px-1.5 py-0.5 text-[9px] font-mono rounded flex-shrink-0',
          active ? 'bg-primary-foreground/20' : 'bg-muted/50'
        )}>
          {section.shortcut}
        </kbd>
      )}
    </button>
  );
}

export { toolGroups };
