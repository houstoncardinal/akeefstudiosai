import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  Palette,
  Sparkles,
  Wand2,
  Download,
  CheckCircle,
  ArrowRight,
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
    <div className="w-full bg-gradient-to-r from-card via-card/95 to-card border border-border/50 rounded-2xl shadow-lg backdrop-blur-sm">
      <div className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
        {/* Header - Mobile: stacked, Desktop: inline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4 lg:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                Workflow Progress
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                Complete each step to generate your edit
              </p>
            </div>
          </div>
          <Badge 
            variant={completedCount === steps.length ? "default" : "secondary"}
            className={cn(
              "text-xs sm:text-sm px-2.5 py-1 sm:px-3 sm:py-1.5 font-semibold self-start sm:self-auto",
              completedCount === steps.length && "bg-success text-success-foreground"
            )}
          >
            {completedCount}/{steps.length} Complete
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 lg:mb-6">
          <Progress 
            value={progressPercent} 
            className="h-2 sm:h-2.5 lg:h-3 bg-muted/50"
          />
        </div>

        {/* Steps - Responsive Grid */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 lg:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step Circle + Label */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 transition-all duration-300',
                      step.complete
                        ? 'bg-success/15 border-success text-success shadow-sm shadow-success/20'
                        : step.active
                        ? 'bg-primary/15 border-primary text-primary shadow-md shadow-primary/30 animate-pulse'
                        : 'bg-muted/30 border-border/50 text-muted-foreground'
                    )}
                  >
                    {step.complete ? (
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                    ) : (
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] sm:text-xs lg:text-sm font-medium mt-1.5 sm:mt-2 transition-colors',
                      step.complete
                        ? 'text-success'
                        : step.active
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div className="flex-1 flex items-center justify-center px-1 sm:px-2 -mt-5 sm:-mt-6">
                    <div
                      className={cn(
                        'h-0.5 sm:h-1 w-full rounded-full transition-all duration-500',
                        steps[index + 1]?.complete
                          ? 'bg-success'
                          : steps[index + 1]?.active
                          ? 'bg-gradient-to-r from-success to-primary'
                          : 'bg-border/50'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
