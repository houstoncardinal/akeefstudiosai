import { useState, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Wand2, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Sparkles,
  Zap,
  Film,
  Music,
  Palette,
  Clock,
  Target,
  Heart,
  Flame,
  Star,
  Camera,
  Volume2,
  Plus,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomRulesEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Vision templates for one-click powerful edits
const VISION_TEMPLATES = [
  {
    id: 'cinematic_drama',
    icon: Film,
    label: 'Cinematic Drama',
    color: 'from-amber-500 to-orange-600',
    rules: `STYLE: Cinematic Film Grade
- Long holds on emotional beats (3-5 seconds)
- Slow push-ins on close-ups
- Dramatic pauses before key moments
- Cross dissolves between scenes (1.5s)
- Desaturated shadows, warm highlights
- Film grain overlay (4%)
- 2.39:1 letterboxing`
  },
  {
    id: 'music_video_hype',
    icon: Music,
    label: 'Music Video Hype',
    color: 'from-purple-500 to-pink-600',
    rules: `STYLE: High-Energy Music Edit
- Cut on EVERY beat during chorus
- Quick jump cuts during verses (0.3-0.5s)
- Speed ramps on bass drops (200% to 50%)
- Flash to white on beat drops
- Zoom pulse on snare hits (108%)
- Whip pans between scenes
- Vibrant saturation boost (+25%)`
  },
  {
    id: 'viral_tiktok',
    icon: Flame,
    label: 'Viral TikTok',
    color: 'from-rose-500 to-red-600',
    rules: `STYLE: TikTok Viral Formula
- Hook in first 0.5 seconds (zoom, flash, text)
- Average shot length under 1 second
- Jump cuts with slight zooms
- On-screen captions for key moments
- Trending sound sync on beats
- 9:16 vertical framing
- High contrast + saturation`
  },
  {
    id: 'emotional_slow',
    icon: Heart,
    label: 'Emotional Slow',
    color: 'from-blue-500 to-indigo-600',
    rules: `STYLE: Emotional & Reflective
- Slow motion on all emotional peaks (50%)
- Long cross dissolves (2-3 seconds)
- Hold on reactions and faces
- Soft vignette (20%)
- Subtle film grain (2%)
- Cool shadows, warm skin tones
- Piano/strings sync for cuts`
  },
  {
    id: 'documentary_raw',
    icon: Camera,
    label: 'Documentary Raw',
    color: 'from-emerald-500 to-teal-600',
    rules: `STYLE: Raw Documentary
- Natural timing, no beat sync
- J-cuts and L-cuts for flow
- Handheld shake preserved
- Interview audio drives cuts
- B-roll inserts on keywords
- Minimal color grading
- Lower thirds for speakers`
  },
  {
    id: 'trailer_epic',
    icon: Star,
    label: 'Epic Trailer',
    color: 'from-yellow-500 to-amber-600',
    rules: `STYLE: Blockbuster Trailer
- Build tension with increasing cut pace
- Black flash hits on impacts
- Bass boom transitions
- Title cards between acts
- Slow-mo hero moments
- 3-act structure (Setup, Rise, Climax)
- End on cliffhanger/question`
  },
];

// Smart suggestion chips
const QUICK_RULES = [
  { label: 'Cut on beat', rule: '- Cut on every major beat of the music', category: 'timing' },
  { label: 'Slow motion 50%', rule: '- Apply 50% slow motion on emotional moments', category: 'speed' },
  { label: 'Jump cuts', rule: '- Use quick jump cuts (0.5s or less) for energy', category: 'timing' },
  { label: 'Flash on drop', rule: '- Flash to white on beat drops', category: 'effects' },
  { label: 'Zoom pulse 105%', rule: '- Add subtle zoom pulse on bass hits (105%)', category: 'motion' },
  { label: '2.39:1 letterbox', rule: '- Add cinematic letterboxing (2.39:1 aspect)', category: 'framing' },
  { label: 'Film grain 4%', rule: '- Apply subtle film grain (2-4%)', category: 'color' },
  { label: 'Vignette 15%', rule: '- Add edge vignette (15-20%)', category: 'color' },
  { label: 'Speed ramp', rule: '- Speed ramp from 200% to 50% on impacts', category: 'speed' },
  { label: 'Whip pan', rule: '- Use whip pan transitions between scenes', category: 'transitions' },
  { label: 'J-cut audio', rule: '- Use J-cuts (audio leads video by 0.5s)', category: 'audio' },
  { label: 'Match cut', rule: '- Use match cuts on similar shapes/movements', category: 'transitions' },
];

export default function CustomRulesEditorEnhanced({ value, onChange, disabled }: CustomRulesEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [quickIdea, setQuickIdea] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [addedRules, setAddedRules] = useState<string[]>([]);

  const addQuickRule = (rule: string) => {
    if (addedRules.includes(rule)) return;
    const newValue = value.trim() ? value.trim() + '\n' + rule : rule;
    onChange(newValue);
    setAddedRules(prev => [...prev, rule]);
  };

  const applyTemplate = (template: typeof VISION_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    onChange(template.rules);
    setAddedRules([]);
  };

  const handleQuickIdeaSubmit = useCallback(() => {
    if (!quickIdea.trim()) return;
    const formattedIdea = `- ${quickIdea.trim()}`;
    const newValue = value.trim() ? value.trim() + '\n' + formattedIdea : formattedIdea;
    onChange(newValue);
    setQuickIdea('');
  }, [quickIdea, value, onChange]);

  const lineCount = value.split('\n').filter(l => l.trim()).length;
  const charCount = value.length;

  return (
    <div className="panel border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 shadow-lg shadow-primary/5">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="panel-header cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">AI Edit Instructions</span>
                  <Badge variant="outline" className="text-[9px] border-primary/40 text-primary">
                    Controls Output
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Describe your vision — the AI will make it happen
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground font-mono">
                {lineCount} rules • {charCount} chars
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 space-y-5">
            {/* Quick Idea Input - Primary action */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={quickIdea}
                    onChange={(e) => setQuickIdea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickIdeaSubmit()}
                    placeholder="Type your idea... e.g., 'cut faster during chorus'"
                    className="h-11 pl-4 pr-10 text-sm bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    disabled={disabled}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Zap className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
                <Button
                  onClick={handleQuickIdeaSubmit}
                  disabled={disabled || !quickIdea.trim()}
                  className="h-11 px-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                Press Enter to add • Be specific about timing, percentages, and sections
              </p>
            </div>

            {/* Vision Templates - One-click powerful presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold">Vision Templates</span>
                <span className="text-[9px] text-muted-foreground">— One-click styles</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {VISION_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      disabled={disabled}
                      className={cn(
                        'relative p-3 rounded-lg border text-left transition-all duration-200 group overflow-hidden',
                        isSelected 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                          : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
                        template.color
                      )} />
                      <div className="relative flex items-center gap-2">
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br',
                          template.color
                        )}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-foreground truncate">{template.label}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold">Quick Add</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[9px] gap-1 px-2"
                  onClick={() => setShowTips(!showTips)}
                >
                  <Lightbulb className="w-3 h-3" />
                  {showTips ? 'Hide Tips' : 'Pro Tips'}
                </Button>
              </div>
              <ScrollArea className="w-full">
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {QUICK_RULES.map((item) => {
                    const isAdded = addedRules.includes(item.rule);
                    return (
                      <Button
                        key={item.label}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-7 text-[10px] px-2.5 transition-all',
                          isAdded 
                            ? 'bg-primary/10 border-primary/40 text-primary' 
                            : 'hover:bg-primary/10 hover:border-primary/50'
                        )}
                        onClick={() => addQuickRule(item.rule)}
                        disabled={disabled || isAdded}
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
                        )}
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Tips Panel */}
            {showTips && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-semibold">Pro Tips for Powerful Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> <strong>Timing:</strong> "cut every 2 beats" not "cut on beat"</p>
                    <p className="flex items-center gap-1"><Music className="w-3 h-3 text-primary" /> <strong>Sections:</strong> Reference verse, chorus, bridge, drop</p>
                    <p className="flex items-center gap-1"><Target className="w-3 h-3 text-primary" /> <strong>Percentages:</strong> "50% slow-mo" "105% zoom"</p>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1"><Camera className="w-3 h-3 text-primary" /> <strong>Shots:</strong> Specify which angles to prioritize</p>
                    <p className="flex items-center gap-1"><Palette className="w-3 h-3 text-primary" /> <strong>Color:</strong> "warm highlights, cool shadows"</p>
                    <p className="flex items-center gap-1"><Volume2 className="w-3 h-3 text-primary" /> <strong>Audio:</strong> "J-cut audio by 0.5s"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Editor */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Your Instructions
                </span>
                <Badge 
                  variant="secondary" 
                  className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary border-0"
                >
                  <Wand2 className="w-2.5 h-2.5 mr-1" />
                  AI Reads This
                </Badge>
              </div>
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={10}
                placeholder="Enter your custom editing instructions here...

Examples:
- Cut on every major beat during the chorus
- Apply slow motion (50%) on emotional moments
- Use teal & orange color grading
- Add film grain for vintage feel
- Hold wide shots for 4+ seconds
- Quick cuts during verses (0.5s average)"
                className="font-mono text-xs leading-relaxed bg-background/80 border-border/50 resize-none focus:border-primary/50 focus:ring-primary/20"
                disabled={disabled}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 text-muted-foreground hover:text-destructive gap-1"
                onClick={() => {
                  onChange('');
                  setSelectedTemplate(null);
                  setAddedRules([]);
                }}
                disabled={disabled || !value}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset All
              </Button>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Check className="w-3 h-3 text-success" />
                <span>Auto-saved</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}