import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Palette,
  Sparkles,
  Wand2,
  Download,
  CheckCircle,
  Circle,
  ChevronRight,
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  label: string;
  icon: typeof Upload;
  complete: boolean;
  active: boolean;
}

interface VisualWorkflowIndicatorProps {
  hasFile: boolean;
  hasStyle: boolean;
  hasEffects: boolean;
  isProcessing: boolean;
  hasOutput: boolean;
}

export default function VisualWorkflowIndicator({
  hasFile,
  hasStyle,
  hasEffects,
  isProcessing,
  hasOutput,
}: VisualWorkflowIndicatorProps) {
  const steps: WorkflowStep[] = [
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      complete: hasFile,
      active: !hasFile,
    },
    {
      id: 'style',
      label: 'Style',
      icon: Palette,
      complete: hasFile && hasStyle,
      active: hasFile && !hasStyle,
    },
    {
      id: 'effects',
      label: 'Effects',
      icon: Sparkles,
      complete: hasFile && hasEffects,
      active: hasFile && hasStyle && !hasEffects,
    },
    {
      id: 'generate',
      label: 'Generate',
      icon: Wand2,
      complete: hasOutput,
      active: isProcessing || (hasFile && hasStyle && !hasOutput),
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      complete: false,
      active: hasOutput,
    },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className="panel p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold">Workflow Progress</span>
        </div>
        <Badge variant="outline" className="text-[9px]">
          {completedCount}/{steps.length} Complete
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all',
                    step.complete
                      ? 'bg-success/10 border-success text-success'
                      : step.active
                      ? 'bg-primary/10 border-primary text-primary animate-pulse'
                      : 'bg-muted/30 border-border/50 text-muted-foreground'
                  )}
                >
                  {step.complete ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-[9px] font-medium mt-1.5',
                    step.complete
                      ? 'text-success'
                      : step.active
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-1 rounded-full',
                    steps[index + 1]?.complete || steps[index + 1]?.active
                      ? 'bg-primary/50'
                      : 'bg-border/50'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
