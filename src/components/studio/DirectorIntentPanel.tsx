import { useState } from 'react';
import { DIRECTOR_INTENTS, type DirectorIntent } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';
import { 
  Wand2, 
  Heart, 
  Gem, 
  Moon, 
  Zap, 
  BookOpen, 
  Film, 
  Cpu, 
  Cloud, 
  Flame,
  Video,
  Sparkles,
  CheckCircle,
  MessageSquare,
  HelpCircle
} from 'lucide-react';

interface DirectorIntentPanelProps {
  selectedIntent: string | null;
  customIntent: string;
  onIntentChange: (intentId: string | null) => void;
  onCustomIntentChange: (intent: string) => void;
  disabled?: boolean;
}

const intentIcons: Record<string, React.ReactNode> = {
  heart: <Heart className="w-5 h-5" />,
  gem: <Gem className="w-5 h-5" />,
  moon: <Moon className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  'book-open': <BookOpen className="w-5 h-5" />,
  film: <Film className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  cloud: <Cloud className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
};

const pacingColors: Record<string, string> = {
  slow: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  fast: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  dynamic: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const energyColors: Record<string, string> = {
  calm: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  moderate: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  explosive: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DirectorIntentPanel({ 
  selectedIntent, 
  customIntent,
  onIntentChange, 
  onCustomIntentChange,
  disabled 
}: DirectorIntentPanelProps) {
  const [showCustom, setShowCustom] = useState(false);

  const selectedIntentData = DIRECTOR_INTENTS.find(i => i.id === selectedIntent);

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            <span className="panel-title">Director Intent Mode</span>
            <InsightTooltip hint={FEATURE_TOOLTIPS['director-intent']} side="right">
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
            </InsightTooltip>
          </div>
          <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
            AI-Powered
          </Badge>
        </div>
        
        <div className="p-4">
          <p className="text-xs text-muted-foreground">
            Tell the AI how you want your edit to <em>feel</em>. 
            Select a mood or describe your vision in your own words.
          </p>
        </div>
      </div>

      {/* Intent Grid */}
      <ScrollArea className="h-[360px]">
        <div className="grid grid-cols-2 gap-3 pr-4">
          {DIRECTOR_INTENTS.map((intent) => {
            const isSelected = selectedIntent === intent.id;
            
            return (
              <div
                key={intent.id}
                className={cn(
                  'preset-card p-4 cursor-pointer transition-all duration-200',
                  isSelected && 'active ring-1 ring-primary/50',
                  disabled && 'opacity-50 pointer-events-none'
                )}
                onClick={() => {
                  onIntentChange(isSelected ? null : intent.id);
                  setShowCustom(false);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center border transition-colors',
                    isSelected 
                      ? 'bg-primary/20 border-primary/40 text-primary' 
                      : 'bg-muted/30 border-border/50 text-muted-foreground'
                  )}>
                    {intentIcons[intent.icon] || <Sparkles className="w-5 h-5" />}
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <h4 className={cn(
                  'text-sm font-semibold mb-1',
                  isSelected && 'text-primary'
                )}>
                  {intent.name}
                </h4>
                <p className="text-[10px] text-muted-foreground mb-3">
                  {intent.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn('text-[8px] px-1.5', pacingColors[intent.pacing])}>
                    {intent.pacing} pacing
                  </Badge>
                  <Badge variant="outline" className={cn('text-[8px] px-1.5', energyColors[intent.energy])}>
                    {intent.energy} energy
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Selected Intent Details */}
      {selectedIntentData && (
        <div className="panel p-4 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">AI Will Apply</span>
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span className="text-muted-foreground">Shot Length</span>
              <span className="font-medium">{selectedIntentData.shotLength[0]}s - {selectedIntentData.shotLength[1]}s</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span className="text-muted-foreground">Color Style</span>
              <span className="font-medium capitalize">{selectedIntentData.colorStyle.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span className="text-muted-foreground">Motion Style</span>
              <span className="font-medium capitalize">{selectedIntentData.motionStyle}</span>
            </div>
            <div className="p-2 rounded bg-muted/30">
              <span className="text-muted-foreground block mb-1">Transitions</span>
              <div className="flex flex-wrap gap-1">
                {selectedIntentData.preferredTransitions.slice(0, 4).map((t) => (
                  <Badge key={t} variant="outline" className="text-[8px] px-1.5">
                    {t.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {selectedIntentData.preferredTransitions.length > 4 && (
                  <Badge variant="outline" className="text-[8px] px-1.5">
                    +{selectedIntentData.preferredTransitions.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Intent */}
      <div className="panel">
        <button
          className="w-full panel-header cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => {
            setShowCustom(!showCustom);
            if (!showCustom) onIntentChange(null);
          }}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Custom Intent</span>
            <InsightTooltip hint={FEATURE_TOOLTIPS['ai-custom-intent']} side="right">
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
            </InsightTooltip>
          </div>
          <Badge variant="outline" className="text-[9px]">
            Describe Your Vision
          </Badge>
        </button>
        
        {showCustom && (
          <div className="p-4 space-y-3">
            <Textarea
              placeholder="Describe how you want the edit to feel...&#10;&#10;Examples:&#10;• Make this feel like a premium car commercial&#10;• Dark and intense, like a thriller movie trailer&#10;• Fun and energetic summer vibes&#10;• Emotional and heartfelt storytelling"
              value={customIntent}
              onChange={(e) => onCustomIntentChange(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
              disabled={disabled}
            />
            <Button
              className="w-full gap-2"
              disabled={!customIntent.trim() || disabled}
            >
              <Wand2 className="w-4 h-4" />
              Apply Custom Intent
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}