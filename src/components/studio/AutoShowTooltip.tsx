import { ReactNode, useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lightbulb, Keyboard, Info, Zap, Star, X } from 'lucide-react';
import { type TooltipHint } from './InsightTooltip';

interface AutoShowTooltipProps {
  children: ReactNode;
  hint: TooltipHint;
  side?: 'top' | 'right' | 'bottom' | 'left';
  showDelay?: number;
  hideDelay?: number;
  onDismiss?: (id: string) => void;
  disabled?: boolean;
  priority?: number;
}

const categoryConfig = {
  feature: {
    icon: Info,
    color: 'text-primary',
    bg: 'bg-primary/10',
    borderColor: 'border-primary/50',
    label: 'Feature',
  },
  workflow: {
    icon: Zap,
    color: 'text-accent',
    bg: 'bg-accent/10',
    borderColor: 'border-accent/50',
    label: 'Workflow',
  },
  'pro-tip': {
    icon: Star,
    color: 'text-warning',
    bg: 'bg-warning/10',
    borderColor: 'border-warning/50',
    label: 'Pro Tip',
  },
  keyboard: {
    icon: Keyboard,
    color: 'text-success',
    bg: 'bg-success/10',
    borderColor: 'border-success/50',
    label: 'Shortcut',
  },
};

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowClasses = {
  top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
};

export default function AutoShowTooltip({
  children,
  hint,
  side = 'top',
  showDelay = 500,
  hideDelay = 5000,
  onDismiss,
  disabled = false,
  priority = 0,
}: AutoShowTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Check if tooltip was already seen
  useEffect(() => {
    const seenTooltips = JSON.parse(localStorage.getItem('akeef_seen_tooltips') || '[]');
    if (seenTooltips.includes(hint.id)) {
      setIsDismissed(true);
    }
  }, [hint.id]);

  // Auto-show and auto-hide logic
  useEffect(() => {
    if (disabled || isDismissed) return;

    // Stagger based on priority
    const staggeredDelay = showDelay + (priority * 800);
    
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, staggeredDelay);

    return () => clearTimeout(showTimer);
  }, [disabled, isDismissed, showDelay, priority]);

  // Auto-hide after showing
  useEffect(() => {
    if (!isVisible) return;

    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, hideDelay);

    return () => clearTimeout(hideTimer);
  }, [isVisible, hideDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Save to localStorage
    const seenTooltips = JSON.parse(localStorage.getItem('akeef_seen_tooltips') || '[]');
    if (!seenTooltips.includes(hint.id)) {
      seenTooltips.push(hint.id);
      localStorage.setItem('akeef_seen_tooltips', JSON.stringify(seenTooltips));
    }
    
    onDismiss?.(hint.id);
  };

  if (disabled) {
    return <>{children}</>;
  }

  const category = hint.category || 'feature';
  const config = categoryConfig[category];
  const CategoryIcon = config.icon;

  return (
    <span ref={containerRef} className="relative inline-flex">
      {children}
      
      {/* Pulsing indicator when not yet shown */}
      {!isDismissed && !isVisible && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse z-10">
          <span className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75" />
        </span>
      )}

      {/* Auto-show tooltip */}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 w-[280px] animate-in fade-in-0 zoom-in-95 duration-300',
            positionClasses[side]
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-8',
              arrowClasses[side],
              side === 'top' && 'border-t-popover',
              side === 'bottom' && 'border-b-popover',
              side === 'left' && 'border-l-popover',
              side === 'right' && 'border-r-popover'
            )}
          />
          
          <div className={cn(
            'rounded-xl overflow-hidden bg-popover/98 backdrop-blur-xl shadow-2xl',
            'border-2',
            config.borderColor,
            'ring-4 ring-primary/10'
          )}>
            {/* Colored header bar */}
            <div className={cn('h-1', config.bg.replace('/10', ''))} />
            
            <div className="p-4 space-y-3">
              {/* Header with dismiss */}
              <div className="flex items-start gap-3">
                <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                  <CategoryIcon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">{hint.title}</p>
                    <button
                      onClick={handleDismiss}
                      className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 mt-1', config.color, config.bg)}>
                    {config.label}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {hint.description}
              </p>

              {/* Tip callout */}
              {hint.tip && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-foreground leading-relaxed">
                    {hint.tip}
                  </p>
                </div>
              )}

              {/* Keyboard shortcut */}
              {hint.shortcut && (
                <div className="flex items-center gap-2 pt-1">
                  <Keyboard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Shortcut:</span>
                  <kbd className="px-2 py-1 text-xs font-mono font-bold bg-muted border border-border rounded-md">
                    {hint.shortcut}
                  </kbd>
                </div>
              )}

              {/* Progress bar showing auto-dismiss */}
              <div className="pt-2">
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn('h-full rounded-full', config.bg.replace('/10', ''))}
                    style={{
                      animation: `shrink ${hideDelay}ms linear forwards`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1">
                  Click anywhere or wait to dismiss
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </span>
  );
}

// Helper to reset seen tooltips (for testing)
export function resetSeenTooltips() {
  localStorage.removeItem('akeef_seen_tooltips');
}
