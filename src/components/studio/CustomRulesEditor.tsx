import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Wand2, 
  Save, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CustomRulesEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const QUICK_RULES = [
  { label: 'Cut on beat', rule: '- Cut on every major beat of the music' },
  { label: 'Slow motion', rule: '- Apply 50% slow motion on emotional moments' },
  { label: 'Jump cuts', rule: '- Use quick jump cuts (0.5s or less) for energy' },
  { label: 'Color flash', rule: '- Flash to white on beat drops' },
  { label: 'Zoom pulse', rule: '- Add subtle zoom pulse on bass hits (105%)' },
  { label: 'Letterbox', rule: '- Add cinematic letterboxing (2.39:1 aspect)' },
  { label: 'Film grain', rule: '- Apply subtle film grain (2-4%)' },
  { label: 'Vignette', rule: '- Add edge vignette (15-20%)' },
];

export default function CustomRulesEditor({ value, onChange, disabled }: CustomRulesEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTips, setShowTips] = useState(false);

  const addQuickRule = (rule: string) => {
    const newValue = value.trim() + '\n' + rule;
    onChange(newValue);
  };

  const lineCount = value.split('\n').length;
  const charCount = value.length;

  return (
    <div className="panel border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="panel-header cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">AI Edit Instructions</span>
                  <Badge variant="outline" className="text-[9px] border-primary/40 text-primary">
                    Controls Output
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  These rules directly control how your video is edited
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground font-mono">
                {lineCount} lines • {charCount} chars
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
          <div className="p-4 space-y-4">
            {/* Quick Add Rules */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Quick Add Rules
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1"
                  onClick={() => setShowTips(!showTips)}
                >
                  <Lightbulb className="w-3 h-3" />
                  {showTips ? 'Hide Tips' : 'Show Tips'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_RULES.map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 hover:bg-primary/10 hover:border-primary/50"
                    onClick={() => addQuickRule(item.rule)}
                    disabled={disabled}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tips Panel */}
            {showTips && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">Pro Tips</span>
                </div>
                <ul className="text-[10px] text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be specific about timing (e.g., "cut every 2 beats" vs "cut on beat")</li>
                  <li>Reference song sections (verse, chorus, bridge, drop)</li>
                  <li>Specify percentages for effects (50% slow-mo, 105% zoom)</li>
                  <li>Mention camera angles you want to prioritize</li>
                  <li>Include color and mood preferences</li>
                </ul>
              </div>
            )}

            {/* Main Editor */}
            <div className="relative">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={12}
                placeholder="Enter your custom editing instructions here...

Examples:
- Cut on every major beat during the chorus
- Apply slow motion (50%) on emotional moments
- Use teal & orange color grading
- Add film grain for vintage feel
- Hold wide shots for 4+ seconds
- Quick cuts during verses (0.5s average)"
                className="font-mono text-xs leading-relaxed bg-background border-border/50 resize-none pr-20"
                disabled={disabled}
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <Badge 
                  variant="secondary" 
                  className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary border-0"
                >
                  <Wand2 className="w-2.5 h-2.5 mr-1" />
                  AI Reads This
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 text-muted-foreground hover:text-destructive"
                onClick={() => onChange('')}
                disabled={disabled || !value}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear All
              </Button>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>Auto-saved</span>
                <Save className="w-3 h-3" />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}