import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import AutoShowTooltip from './AutoShowTooltip';
import { FEATURE_TOOLTIPS, type TooltipHint } from './InsightTooltip';

interface TooltipManagerContextType {
  registerTooltip: (id: string, priority: number) => void;
  isTooltipActive: (id: string) => boolean;
  dismissTooltip: (id: string) => void;
  resetAllTooltips: () => void;
  hasSeenOnboarding: boolean;
}

const TooltipManagerContext = createContext<TooltipManagerContextType | null>(null);

export function useTooltipManager() {
  const context = useContext(TooltipManagerContext);
  if (!context) {
    throw new Error('useTooltipManager must be used within TooltipManagerProvider');
  }
  return context;
}

interface TooltipManagerProviderProps {
  children: ReactNode;
}

// Key tooltips to show on first load, in order of priority
const ONBOARDING_TOOLTIPS = [
  { id: 'source-upload', priority: 0 },
  { id: 'style-presets', priority: 1 },
  { id: 'color-lut', priority: 2 },
  { id: 'export-generate', priority: 3 },
];

export function TooltipManagerProvider({ children }: TooltipManagerProviderProps) {
  const [activeTooltips, setActiveTooltips] = useState<Set<string>>(new Set());
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('akeef_onboarding_complete') === 'true';
    setHasSeenOnboarding(seen);
  }, []);

  const registerTooltip = (id: string, priority: number) => {
    setActiveTooltips(prev => new Set([...prev, id]));
  };

  const isTooltipActive = (id: string) => activeTooltips.has(id);

  const dismissTooltip = (id: string) => {
    setActiveTooltips(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    // Check if all onboarding tooltips are dismissed
    const seenTooltips = JSON.parse(localStorage.getItem('akeef_seen_tooltips') || '[]');
    const allSeen = ONBOARDING_TOOLTIPS.every(t => seenTooltips.includes(t.id));
    if (allSeen && !hasSeenOnboarding) {
      localStorage.setItem('akeef_onboarding_complete', 'true');
      setHasSeenOnboarding(true);
    }
  };

  const resetAllTooltips = () => {
    localStorage.removeItem('akeef_seen_tooltips');
    localStorage.removeItem('akeef_onboarding_complete');
    setHasSeenOnboarding(false);
    window.location.reload();
  };

  return (
    <TooltipManagerContext.Provider value={{
      registerTooltip,
      isTooltipActive,
      dismissTooltip,
      resetAllTooltips,
      hasSeenOnboarding,
    }}>
      {children}
    </TooltipManagerContext.Provider>
  );
}

// Wrapper component for easy use
interface OnboardingTooltipProps {
  children: ReactNode;
  tooltipId: keyof typeof FEATURE_TOOLTIPS;
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

export function OnboardingTooltip({ 
  children, 
  tooltipId, 
  side = 'right',
  disabled = false 
}: OnboardingTooltipProps) {
  const hint = FEATURE_TOOLTIPS[tooltipId];
  const onboardingItem = ONBOARDING_TOOLTIPS.find(t => t.id === tooltipId);
  
  if (!hint || disabled) {
    return <>{children}</>;
  }

  return (
    <AutoShowTooltip
      hint={hint}
      side={side}
      priority={onboardingItem?.priority ?? 10}
      showDelay={800}
      hideDelay={6000}
    >
      {children}
    </AutoShowTooltip>
  );
}

export { ONBOARDING_TOOLTIPS };
