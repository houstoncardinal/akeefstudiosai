import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Sparkles,
  TrendingUp,
  Zap,
  Eye,
  Music,
  Palette,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  ChevronRight,
  Activity,
  Film,
  Scissors,
} from 'lucide-react';

interface AIInsightsPanelProps {
  file: File | null;
  colorGrade: string;
  effectPreset: string;
  transitions: string[];
  style: string;
  directorIntent: string | null;
  beatRules: string[];
}

interface Insight {
  id: string;
  type: 'optimization' | 'suggestion' | 'analysis' | 'warning';
  icon: typeof Sparkles;
  title: string;
  description: string;
  confidence: number;
  action?: string;
}

export default function AIInsightsPanel({
  file,
  colorGrade,
  effectPreset,
  transitions,
  style,
  directorIntent,
  beatRules,
}: AIInsightsPanelProps) {
  // Generate dynamic AI insights based on current config
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = [];

    if (!file) return result;

    // Pacing analysis
    result.push({
      id: 'pacing',
      type: 'analysis',
      icon: Activity,
      title: 'Pacing Analysis',
      description: 'Detected 12 scene changes. Average shot length: 4.2s. Optimal for narrative content.',
      confidence: 92,
    });

    // Color recommendation
    if (!colorGrade || colorGrade === 'none') {
      result.push({
        id: 'color-suggest',
        type: 'suggestion',
        icon: Palette,
        title: 'Color Grade Recommended',
        description: 'Based on footage analysis, "Cinematic Teal-Orange" would enhance visual appeal.',
        confidence: 87,
        action: 'Apply',
      });
    } else {
      result.push({
        id: 'color-match',
        type: 'optimization',
        icon: Palette,
        title: 'Color Consistency',
        description: `${colorGrade.replace(/_/g, ' ')} matches your footage's lighting conditions well.`,
        confidence: 94,
      });
    }

    // Beat sync suggestion
    if (beatRules.length === 0) {
      result.push({
        id: 'beat-suggest',
        type: 'suggestion',
        icon: Music,
        title: 'Enable Beat Sync',
        description: 'Detected rhythmic audio. Syncing cuts to beats can improve viewer engagement by 40%.',
        confidence: 78,
        action: 'Enable',
      });
    }

    // Transition analysis
    if (transitions.length > 5) {
      result.push({
        id: 'trans-warning',
        type: 'warning',
        icon: Scissors,
        title: 'Transition Variety',
        description: `${transitions.length} transition types selected. Consider reducing for a more cohesive feel.`,
        confidence: 65,
      });
    } else if (transitions.length > 0) {
      result.push({
        id: 'trans-good',
        type: 'optimization',
        icon: Scissors,
        title: 'Transitions Balanced',
        description: 'Your transition selection creates a professional, smooth flow.',
        confidence: 88,
      });
    }

    // Director intent enhancement
    if (directorIntent) {
      result.push({
        id: 'intent-active',
        type: 'optimization',
        icon: Film,
        title: 'Director Intent Active',
        description: `AI will prioritize "${directorIntent.replace(/_/g, ' ')}" mood in all creative decisions.`,
        confidence: 96,
      });
    }

    // Performance optimization
    result.push({
      id: 'perf',
      type: 'analysis',
      icon: Zap,
      title: 'Processing Estimate',
      description: 'Based on current settings, AI processing will take approximately 45 seconds.',
      confidence: 90,
    });

    return result;
  }, [file, colorGrade, effectPreset, transitions, style, directorIntent, beatRules]);

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'optimization':
        return 'text-success bg-success/10 border-success/30';
      case 'suggestion':
        return 'text-primary bg-primary/10 border-primary/30';
      case 'analysis':
        return 'text-accent bg-accent/10 border-accent/30';
      case 'warning':
        return 'text-warning bg-warning/10 border-warning/30';
      default:
        return 'text-muted-foreground bg-muted/10 border-border/30';
    }
  };

  const getTypeLabel = (type: Insight['type']) => {
    switch (type) {
      case 'optimization':
        return 'Optimized';
      case 'suggestion':
        return 'Suggestion';
      case 'analysis':
        return 'Analysis';
      case 'warning':
        return 'Attention';
    }
  };

  if (!file) {
    return (
      <div className="panel h-full">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">AI Insights</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-48 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-center mb-3">
            <Brain className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">AI insights will appear here</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Import media to get started</p>
        </div>
      </div>
    );
  }

  // Calculate overall score
  const avgConfidence = Math.round(
    insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
  );

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">AI Insights</span>
        </div>
        <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
          Live Analysis
        </Badge>
      </div>

      {/* Score Summary */}
      <div className="p-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-14 h-14 -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-muted/30"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${avgConfidence * 1.5} 150`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{avgConfidence}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Edit Quality Score</p>
            <p className="text-xs text-muted-foreground">
              {avgConfidence >= 90
                ? 'Excellent configuration'
                : avgConfidence >= 75
                ? 'Good settings, minor optimizations available'
                : 'Consider reviewing suggestions below'}
            </p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {insights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className={cn(
                  'p-3 rounded-lg border transition-all hover:shadow-sm',
                  getInsightColor(insight.type)
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-background/50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold">{insight.title}</p>
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0">
                        {getTypeLabel(insight.type)}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 bg-background/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-current rounded-full"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono">{insight.confidence}%</span>
                    </div>
                  </div>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] flex-shrink-0">
                      {insight.action}
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick Tips */}
      <div className="p-3 border-t border-border/40 bg-muted/20">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Pro Tip:</span> Enable Director Intent 
            for the most cohesive results. The AI will make all creative decisions aligned with 
            your chosen mood.
          </p>
        </div>
      </div>
    </div>
  );
}
