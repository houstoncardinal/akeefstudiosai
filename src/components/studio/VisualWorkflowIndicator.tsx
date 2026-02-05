import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Palette,
  Sparkles,
  Wand2,
  Download,
  CheckCircle,
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
  orientation?: 'horizontal' | 'vertical';
}

export default function VisualWorkflowIndicator({
  hasFile,
  hasStyle,
  hasEffects,
  isProcessing,
  hasOutput,
  orientation = 'horizontal',
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

  // Vertical layout for desktop sidebar
  if (orientation === 'vertical') {
    return (
      <div className="bg-card/80 border border-border/50 rounded-xl p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-foreground">Workflow</span>
          <Badge 
            variant={completedCount === steps.length ? "default" : "secondary"}
            className={cn(
              "text-[10px] px-1.5 py-0.5",
              completedCount === steps.length && "bg-success text-success-foreground"
            )}
          >
            {completedCount}/{steps.length}
          </Badge>
        </div>

        <div className="space-y-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center gap-2">
                {/* Step icon */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                    step.complete
                      ? 'bg-success/15 text-success'
                      : step.active
                      ? 'bg-primary/15 text-primary animate-pulse'
                      : 'bg-muted/30 text-muted-foreground'
                  )}
                >
                  {step.complete ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Step label */}
                <span
                  className={cn(
                    'text-[11px] font-medium flex-1 transition-colors',
                    step.complete
                      ? 'text-success'
                      : step.active
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>

                {/* Connector line (vertical) */}
                {!isLast && (
                  <div className="absolute left-[16px] mt-7 w-0.5 h-1 bg-border/30" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal layout (mobile/tablet)
  return (
    <div className="bg-card/80 border border-border/50 rounded-xl px-3 py-2.5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Progress label */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Progress</span>
          <Badge 
            variant={completedCount === steps.length ? "default" : "secondary"}
            className={cn(
              "text-[10px] px-1.5 py-0",
              completedCount === steps.length && "bg-success text-success-foreground"
            )}
          >
            {completedCount}/{steps.length}
          </Badge>
        </div>

        {/* Steps row */}
        <div className="flex-1 flex items-center justify-between gap-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all',
                      step.complete
                        ? 'bg-success/15 text-success'
                        : step.active
                        ? 'bg-primary/15 text-primary animate-pulse'
                        : 'bg-muted/30 text-muted-foreground'
                    )}
                  >
                    {step.complete ? (
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[8px] sm:text-[9px] font-medium mt-0.5 transition-colors',
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

                {/* Connector line */}
                {!isLast && (
                  <div className="flex-1 flex items-center justify-center px-0.5 -mt-4">
                    <div
                      className={cn(
                        'h-0.5 w-full rounded-full transition-all',
                        steps[index + 1]?.complete
                          ? 'bg-success'
                          : steps[index + 1]?.active
                          ? 'bg-gradient-to-r from-success to-primary'
                          : 'bg-border/40'
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
