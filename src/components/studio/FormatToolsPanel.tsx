import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Wrench, Sparkles, Palette, RefreshCw, Clock, Camera, Scan, Music,
  Move, Maximize, Crosshair, User, Droplet, FastForward, Eraser, Sun, Copy,
  Zap, Crown, Lock
} from 'lucide-react';
import { 
  FORMAT_TOOLS, 
  getToolsForFormat, 
  type FormatTool, 
  type VideoFormat 
} from '@/lib/formats';

interface FormatToolsPanelProps {
  format: VideoFormat | null;
  selectedTools: string[];
  onToolsChange: (tools: string[]) => void;
  disabled?: boolean;
}

const toolIcons: Record<string, React.ReactNode> = {
  copy: <Copy className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  palette: <Palette className="w-4 h-4" />,
  'refresh-cw': <RefreshCw className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
  scan: <Scan className="w-4 h-4" />,
  music: <Music className="w-4 h-4" />,
  move: <Move className="w-4 h-4" />,
  maximize: <Maximize className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
  crosshair: <Crosshair className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  droplet: <Droplet className="w-4 h-4" />,
  'fast-forward': <FastForward className="w-4 h-4" />,
  eraser: <Eraser className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  ai: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  codec: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30',
  optimization: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30',
  repair: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  analysis: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30',
};

const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  ai: { label: 'AI Powered', icon: <Sparkles className="w-3 h-3" /> },
  color: { label: 'Color', icon: <Palette className="w-3 h-3" /> },
  codec: { label: 'Codec', icon: <RefreshCw className="w-3 h-3" /> },
  optimization: { label: 'Optimize', icon: <Zap className="w-3 h-3" /> },
  repair: { label: 'Repair', icon: <Wrench className="w-3 h-3" /> },
  analysis: { label: 'Analysis', icon: <Scan className="w-3 h-3" /> },
};

export default function FormatToolsPanel({ format, selectedTools, onToolsChange, disabled }: FormatToolsPanelProps) {
  const [showAllTools, setShowAllTools] = useState(false);
  
  const availableTools = format ? getToolsForFormat(format.id) : [];
  const allTools = showAllTools ? FORMAT_TOOLS : availableTools;
  
  // Group tools by category
  const groupedTools = allTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, FormatTool[]>);
  
  const toggleTool = (toolId: string) => {
    if (disabled) return;
    if (selectedTools.includes(toolId)) {
      onToolsChange(selectedTools.filter(t => t !== toolId));
    } else {
      onToolsChange([...selectedTools, toolId]);
    }
  };
  
  if (!format) {
    return (
      <div className="panel h-full">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Format Tools</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="w-14 h-14 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">Import a video to see available tools</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="panel h-full overflow-hidden flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">AI Tools</span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1">
            {availableTools.length} available
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Show all</span>
          <Switch 
            checked={showAllTools} 
            onCheckedChange={setShowAllTools}
            className="scale-75"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {Object.entries(groupedTools).map(([category, tools]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {categoryLabels[category]?.icon}
                <span className="text-[10px] uppercase tracking-wider font-medium">
                  {categoryLabels[category]?.label || category}
                </span>
              </div>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {tools.map((tool) => {
                const isSelected = selectedTools.includes(tool.id);
                const isAvailable = availableTools.some(t => t.id === tool.id);
                
                return (
                  <button
                    key={tool.id}
                    onClick={() => isAvailable && toggleTool(tool.id)}
                    disabled={disabled || !isAvailable}
                    className={cn(
                      'relative p-3 rounded-xl border text-left transition-all duration-200 group',
                      isSelected && isAvailable
                        ? `bg-gradient-to-r ${categoryColors[category]} border-primary/50 shadow-lg shadow-primary/10`
                        : isAvailable
                          ? 'bg-card/50 border-border/50 hover:border-primary/30 hover:bg-muted/30'
                          : 'bg-muted/10 border-border/20 opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0',
                        isSelected ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground group-hover:text-primary'
                      )}>
                        {toolIcons[tool.icon] || <Wrench className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-sm font-medium truncate',
                            isSelected ? 'text-foreground' : 'text-foreground/80'
                          )}>
                            {tool.name}
                          </span>
                          {tool.isPro && (
                            <Badge className="text-[8px] px-1 py-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                              <Crown className="w-2 h-2 mr-0.5" />
                              PRO
                            </Badge>
                          )}
                          {!isAvailable && (
                            <Lock className="w-3 h-3 text-muted-foreground/50" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {tool.description}
                        </p>
                      </div>
                      
                      {isAvailable && (
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                          isSelected 
                            ? 'bg-primary border-primary' 
                            : 'border-border/50 group-hover:border-primary/50'
                        )}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {selectedTools.length > 0 && (
        <div className="p-3 border-t border-border/30 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              <span className="text-primary font-semibold">{selectedTools.length}</span> tools selected
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-[10px] px-2"
              onClick={() => onToolsChange([])}
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}