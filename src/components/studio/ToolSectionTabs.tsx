import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ToolSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ToolGroup {
  id: string;
  label: string;
  sections: ToolSection[];
}

const toolGroups: ToolGroup[] = [
  {
    id: 'creative',
    label: 'Creative',
    sections: [
      { id: 'style', label: 'Style', icon: null },
      { id: 'color', label: 'Color', icon: null },
      { id: 'effects', label: 'Effects', icon: null },
      { id: 'graphics', label: 'Graphics', icon: null },
      { id: 'transitions', label: 'Transitions', icon: null },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    sections: [
      { id: 'tools', label: 'AI Tools', icon: null },
      { id: 'shots', label: 'Shots', icon: null },
      { id: 'beats', label: 'Beats', icon: null },
      { id: 'intent', label: 'Intent', icon: null },
    ],
  },
  {
    id: 'output',
    label: 'Output',
    sections: [
      { id: 'versions', label: 'Versions', icon: null },
      { id: 'export', label: 'Export', icon: null },
      { id: 'exports', label: 'My Exports', icon: null },
    ],
  },
];

interface ToolSectionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  icons: Record<string, React.ReactNode>;
}

export default function ToolSectionTabs({ activeTab, onTabChange, icons }: ToolSectionTabsProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['creative', 'automation', 'output']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  // Find which group contains the active tab
  const activeGroup = toolGroups.find(g => g.sections.some(s => s.id === activeTab));

  return (
    <div className="space-y-1">
      {toolGroups.map((group) => {
        const isExpanded = expandedGroups.includes(group.id);
        const hasActiveTab = group.sections.some(s => s.id === activeTab);
        
        return (
          <Collapsible key={group.id} open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              hasActiveTab ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground/80"
            )}>
              <span>{group.label}</span>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-2 mt-0.5 space-y-0.5">
              {group.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onTabChange(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    activeTab === section.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    {icons[section.id]}
                  </span>
                  {section.label}
                </button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

export { toolGroups };
