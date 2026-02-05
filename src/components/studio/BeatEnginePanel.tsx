import { useState } from 'react';
import { BEAT_ANALYSIS_TYPES, BEAT_SYNC_RULES, type BeatSyncRule } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Disc, 
  Activity, 
  Mic, 
  TrendingUp, 
  VolumeX, 
  BarChart3,
  Play,
  Pause,
  Zap,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  Slash
} from 'lucide-react';

interface BeatEnginePanelProps {
  beatRules: string[];
  onBeatRulesChange: (rules: string[]) => void;
  disabled?: boolean;
}

const beatIcons: Record<string, React.ReactNode> = {
  activity: <Activity className="w-4 h-4" />,
  'chevrons-down': <ChevronDown className="w-4 h-4" />,
  disc: <Disc className="w-4 h-4" />,
  circle: <Circle className="w-4 h-4" />,
  slash: <Slash className="w-4 h-4" />,
  mic: <Mic className="w-4 h-4" />,
  'trending-up': <TrendingUp className="w-4 h-4" />,
  'volume-x': <VolumeX className="w-4 h-4" />,
  'bar-chart': <BarChart3 className="w-4 h-4" />,
};

const intensityColors: Record<string, string> = {
  light: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  heavy: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function BeatEnginePanel({ 
  beatRules, 
  onBeatRulesChange, 
  disabled 
}: BeatEnginePanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectedBPM, setDetectedBPM] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [beatOffset, setBeatOffset] = useState(0);
  const [quantize, setQuantize] = useState(true);
  
  // Energy visualization mock data
  const energyCurve = Array.from({ length: 50 }, (_, i) => 
    Math.sin(i * 0.3) * 0.3 + Math.random() * 0.4 + 0.3
  );

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setDetectedBPM(Math.floor(Math.random() * 60) + 90); // 90-150 BPM
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 200);
  };

  const handleToggleRule = (ruleId: string) => {
    if (disabled) return;
    
    if (beatRules.includes(ruleId)) {
      onBeatRulesChange(beatRules.filter(id => id !== ruleId));
    } else {
      onBeatRulesChange([...beatRules, ruleId]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Music className="w-3.5 h-3.5 text-primary" />
            <span className="panel-title">Beat & Energy Engine</span>
          </div>
          <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
            AI-Powered
          </Badge>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Analyze audio to detect BPM, beats, drops, and energy levels. 
            Automatically sync cuts and effects to the rhythm.
          </p>
          
          {/* Analysis Button */}
          <Button
            onClick={handleStartAnalysis}
            disabled={disabled || isAnalyzing}
            className="w-full h-12 gap-2 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground"
          >
            {isAnalyzing ? (
              <>
                <Activity className="w-5 h-5 animate-pulse" />
                <span>Analyzing Audio...</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>Analyze Audio Track</span>
              </>
            )}
          </Button>
          
          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Detecting beats...</span>
                <span className="font-mono text-primary">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
          
          {/* BPM Display */}
          {detectedBPM && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Detected Tempo</p>
                  <p className="text-xl font-bold text-primary font-mono">{detectedBPM} <span className="text-xs font-normal">BPM</span></p>
                </div>
              </div>
              <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Synced
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Energy Visualization */}
      {detectedBPM && (
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold">Energy Curve</span>
          </div>
          <div className="h-16 flex items-end gap-0.5 bg-muted/20 rounded-lg p-2 overflow-hidden">
            {energyCurve.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary/80 to-accent/60 rounded-t-sm transition-all duration-150"
                style={{ height: `${value * 100}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>0:00</span>
            <span>Verse</span>
            <span>Chorus</span>
            <span>Drop</span>
            <span>End</span>
          </div>
        </div>
      )}

      {/* Beat Detection Types */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Disc className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Detection Types</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {BEAT_ANALYSIS_TYPES.map((type) => (
              <div
                key={type.id}
                className={cn(
                  'p-2 rounded-lg border text-center transition-all cursor-pointer',
                  type.syncable 
                    ? 'border-primary/30 bg-primary/5 hover:bg-primary/10' 
                    : 'border-border/50 bg-muted/20'
                )}
              >
                <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-muted/30 flex items-center justify-center">
                  {beatIcons[type.icon] || <Music className="w-4 h-4" />}
                </div>
                <p className="text-[9px] font-medium truncate">{type.name}</p>
                {type.syncable && (
                  <Badge variant="outline" className="text-[7px] px-1 py-0 mt-1 bg-primary/10 text-primary border-primary/20">
                    Sync
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Beat Sync Rules */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span className="panel-title">Sync Rules</span>
          </div>
          <Badge variant="outline" className="text-[9px]">
            {beatRules.length} active
          </Badge>
        </div>
        <ScrollArea className="h-48">
          <div className="p-4 space-y-2">
            {BEAT_SYNC_RULES.map((rule) => {
              const isActive = beatRules.includes(rule.id);
              
              return (
                <div
                  key={rule.id}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-all',
                    isActive 
                      ? 'border-primary/40 bg-primary/10' 
                      : 'border-border/50 bg-muted/20 hover:bg-muted/30',
                    disabled && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => handleToggleRule(rule.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-6 h-6 rounded-md flex items-center justify-center',
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                      )}>
                        {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <p className={cn('text-xs font-semibold', isActive && 'text-primary')}>
                          {rule.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn('text-[8px]', intensityColors[rule.intensity])}>
                      {rule.intensity}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Advanced Settings */}
      <div className="panel">
        <button
          className="w-full panel-header cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <div className="flex items-center gap-2">
            <span className="panel-title">Advanced Settings</span>
          </div>
          {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {showAdvanced && (
          <div className="p-4 space-y-4">
            {/* Sensitivity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Beat Sensitivity</label>
                <span className="text-xs text-muted-foreground font-mono">{sensitivity}%</span>
              </div>
              <Slider
                value={[sensitivity]}
                onValueChange={([val]) => setSensitivity(val)}
                min={0}
                max={100}
                step={1}
                disabled={disabled}
              />
            </div>

            {/* Beat Offset */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Beat Offset</label>
                <span className="text-xs text-muted-foreground font-mono">{beatOffset}ms</span>
              </div>
              <Slider
                value={[beatOffset]}
                onValueChange={([val]) => setBeatOffset(val)}
                min={-100}
                max={100}
                step={5}
                disabled={disabled}
              />
            </div>

            {/* Quantize Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="text-xs font-medium">Quantize Cuts</p>
                <p className="text-[9px] text-muted-foreground">Snap cuts to nearest beat</p>
              </div>
              <Switch
                checked={quantize}
                onCheckedChange={setQuantize}
                disabled={disabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}