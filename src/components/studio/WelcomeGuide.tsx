import { useState } from 'react';
import { X, Sparkles, Upload, Palette, Download, Keyboard, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WelcomeGuideProps {
  onComplete: () => void;
  onDismiss: () => void;
}

const steps = [
  {
    icon: Upload,
    title: 'Import Your Media',
    description: 'Drag & drop a video file or timeline project (FCPXML) to get started.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Palette,
    title: 'Choose Your Style',
    description: 'Select a style preset and color grade to define your edit\'s look and feel.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Sparkles,
    title: 'Generate with AI',
    description: 'Click "Generate AI Edit" and let our AI create a professional edit for you.',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: Download,
    title: 'Save Your Edit',
    description: 'Download your finished edit as a video file or project file for your NLE.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
];

export default function WelcomeGuide({ onComplete, onDismiss }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 z-10"
          onClick={handleSkip}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="relative p-6 sm:p-8">
          {/* Welcome header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Welcome to Akeef Studio</h2>
            <p className="text-sm text-muted-foreground">Let's get you started with AI-powered video editing</p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Current step */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border transition-all duration-300',
                    isActive
                      ? 'bg-muted/50 border-primary/30 scale-[1.02]'
                      : isCompleted
                      ? 'bg-muted/20 border-border/30 opacity-60'
                      : 'border-transparent opacity-40'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    isActive ? step.bg : 'bg-muted/50'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Icon className={cn('w-5 h-5', isActive ? step.color : 'text-muted-foreground')} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-semibold',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    {isActive && (
                      <p className="text-sm text-muted-foreground mt-1 animate-fade-in">
                        {step.description}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs font-mono px-2 py-1 rounded',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground/50'
                  )}>
                    {index + 1}/{steps.length}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Keyboard hint */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⇧?</kbd> anytime to see keyboard shortcuts</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip tutorial
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
