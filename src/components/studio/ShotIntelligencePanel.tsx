import { useState } from 'react';
import { SHOT_ANALYSIS_TYPES, type ShotAnalysis } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Scan, 
  Camera, 
  Sparkles, 
  Lightbulb, 
  User, 
  Zap, 
  Heart,
  CheckCircle,
  AlertCircle,
  Play,
  Filter,
  Star,
  Video,
  Sun,
  Focus,
  Grid3X3,
  Move,
  Gauge,
  Lock,
  Image,
  Frame
} from 'lucide-react';

interface ShotIntelligencePanelProps {
  analysisRules: Record<string, string[]>;
  onRulesChange: (rules: Record<string, string[]>) => void;
  disabled?: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
  framing: <Frame className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
  quality: <Star className="w-4 h-4" />,
  content: <User className="w-4 h-4" />,
  emotion: <Heart className="w-4 h-4" />,
};

const analysisIcons: Record<string, React.ReactNode> = {
  frame: <Frame className="w-4 h-4" />,
  grid: <Grid3X3 className="w-4 h-4" />,
  ratio: <Image className="w-4 h-4" />,
  move: <Move className="w-4 h-4" />,
  lock: <Lock className="w-4 h-4" />,
  gauge: <Gauge className="w-4 h-4" />,
  eye: <Eye className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  lightbulb: <Lightbulb className="w-4 h-4" />,
  grain: <Sparkles className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  focus: <Focus className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
};

interface ShotFilter {
  id: string;
  analysisType: string;
  condition: 'include' | 'exclude' | 'prefer';
  values: string[];
}

export default function ShotIntelligencePanel({ 
  analysisRules, 
  onRulesChange, 
  disabled 
}: ShotIntelligencePanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeFilters, setActiveFilters] = useState<ShotFilter[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('framing');

  const analysisByCategory = SHOT_ANALYSIS_TYPES.reduce((acc, analysis) => {
    if (!acc[analysis.category]) acc[analysis.category] = [];
    acc[analysis.category].push(analysis);
    return acc;
  }, {} as Record<string, ShotAnalysis[]>);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const handleToggleValue = (analysisId: string, value: string) => {
    const current = analysisRules[analysisId] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onRulesChange({
      ...analysisRules,
      [analysisId]: updated,
    });
  };

  const handleAddFilter = (analysisType: string, condition: 'include' | 'exclude' | 'prefer', values: string[]) => {
    setActiveFilters(prev => [...prev, {
      id: crypto.randomUUID(),
      analysisType,
      condition,
      values,
    }]);
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span className="panel-title">Shot Intelligence</span>
          </div>
          <Badge variant="outline" className="text-[9px] bg-primary/10 border-primary/30 text-primary">
            AI-Powered
          </Badge>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            AI analyzes your footage to detect shot types, camera motion, faces, lighting, and more. 
            Use filters to automatically select the best shots.
          </p>
          
          {/* Analysis Button */}
          <Button
            onClick={handleStartAnalysis}
            disabled={disabled || isAnalyzing}
            className="w-full h-12 gap-2 bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground"
          >
            {isAnalyzing ? (
              <>
                <Scan className="w-5 h-5 animate-pulse" />
                <span>Analyzing Footage...</span>
              </>
            ) : (
              <>
                <Scan className="w-5 h-5" />
                <span>Analyze All Clips</span>
              </>
            )}
          </Button>
          
          {/* Progress */}
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Processing clips...</span>
                <span className="font-mono text-primary">{Math.round(analysisProgress)}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold">Active Filters</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px]"
              onClick={() => setActiveFilters([])}
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className={cn(
                  'text-[10px] px-2 py-1 gap-1 cursor-pointer hover:opacity-80',
                  filter.condition === 'include' && 'bg-success/20 text-success border-success/30',
                  filter.condition === 'exclude' && 'bg-destructive/20 text-destructive border-destructive/30',
                  filter.condition === 'prefer' && 'bg-primary/20 text-primary border-primary/30'
                )}
                onClick={() => handleRemoveFilter(filter.id)}
              >
                {filter.condition === 'include' && '✓'}
                {filter.condition === 'exclude' && '✕'}
                {filter.condition === 'prefer' && '★'}
                {filter.values.join(', ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Categories */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {Object.entries(analysisByCategory).map(([category, analyses]) => (
            <div key={category} className="panel">
              <button
                className="w-full panel-header cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <div className="flex items-center gap-2">
                  {categoryIcons[category]}
                  <span className="panel-title capitalize">{category}</span>
                </div>
                <Badge variant="outline" className="text-[9px]">
                  {analyses.length} types
                </Badge>
              </button>
              
              {expandedCategory === category && (
                <div className="p-4 space-y-4">
                  {analyses.map((analysis) => (
                    <div key={analysis.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        {analysisIcons[analysis.icon] || <Sparkles className="w-3.5 h-3.5" />}
                        <span className="text-xs font-semibold">{analysis.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{analysis.description}</p>
                      
                      {/* Value Pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.values.map((value) => {
                          const isSelected = analysisRules[analysis.id]?.includes(value);
                          return (
                            <Badge
                              key={value}
                              variant="outline"
                              className={cn(
                                'text-[9px] px-2 py-0.5 cursor-pointer transition-all',
                                isSelected 
                                  ? 'bg-primary/20 border-primary/40 text-primary' 
                                  : 'hover:bg-muted/50'
                              )}
                              onClick={() => handleToggleValue(analysis.id, value)}
                            >
                              {isSelected && <CheckCircle className="w-2.5 h-2.5 mr-1" />}
                              {value}
                            </Badge>
                          );
                        })}
                      </div>
                      
                      {/* Quick Actions */}
                      {analysisRules[analysis.id]?.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[9px] gap-1 text-success border-success/30 hover:bg-success/10"
                            onClick={() => handleAddFilter(analysis.id, 'include', analysisRules[analysis.id])}
                          >
                            <CheckCircle className="w-2.5 h-2.5" />
                            Only Use
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[9px] gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleAddFilter(analysis.id, 'exclude', analysisRules[analysis.id])}
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            Exclude
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-[9px] gap-1 text-primary border-primary/30 hover:bg-primary/10"
                            onClick={() => handleAddFilter(analysis.id, 'prefer', analysisRules[analysis.id])}
                          >
                            <Star className="w-2.5 h-2.5" />
                            Prefer
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Smart Presets */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold">Smart Presets</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] justify-start gap-2"
            disabled={disabled}
            onClick={() => {
              handleAddFilter('shot_type', 'include', ['Close-up', 'Extreme Close-up']);
              handleAddFilter('faces_detected', 'include', ['1 Face']);
            }}
          >
            <User className="w-3 h-3" />
            Artist Close-ups
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] justify-start gap-2"
            disabled={disabled}
            onClick={() => {
              handleAddFilter('focus_quality', 'exclude', ['Out of Focus', 'Soft']);
              handleAddFilter('stabilization', 'exclude', ['Very Shaky', 'Shaky']);
            }}
          >
            <AlertCircle className="w-3 h-3" />
            Remove Bad Shots
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] justify-start gap-2"
            disabled={disabled}
            onClick={() => {
              handleAddFilter('energy_level', 'prefer', ['High', 'Very High', 'Explosive']);
              handleAddFilter('performance', 'include', ['Hero Shot', 'Great']);
            }}
          >
            <Zap className="w-3 h-3" />
            Best Performance
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[10px] justify-start gap-2"
            disabled={disabled}
            onClick={() => {
              handleAddFilter('shot_type', 'prefer', ['Wide Shot', 'Extreme Wide']);
              handleAddFilter('camera_motion', 'include', ['Crane', 'Drone', 'Dolly']);
            }}
          >
            <Video className="w-3 h-3" />
            Cinematic Shots
          </Button>
        </div>
      </div>
    </div>
  );
}