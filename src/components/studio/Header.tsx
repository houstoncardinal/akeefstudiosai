import { Sparkles, Cpu, Zap, Activity, Crown, Hexagon, Menu, X, Keyboard } from 'lucide-react';
import { useState } from 'react';
import ThemeSelector from './ThemeSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-14 border-b border-border/40 bg-card/95 backdrop-blur-xl sticky top-0 z-50 safe-area-top">
      <div className="max-w-[2000px] mx-auto px-3 sm:px-4 h-full flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-foreground flex items-center justify-center">
              <Hexagon className="w-4 h-4 sm:w-5 sm:h-5 text-background" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="font-display font-bold text-sm sm:text-base tracking-tight text-foreground flex items-center gap-1.5">
              <span className="truncate">Akeef Studio's</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary flex-shrink-0">
                PRO
              </Badge>
            </h1>
            <span className="text-[9px] text-muted-foreground tracking-wide hidden sm:block">Enterprise Video Platform</span>
          </div>
        </div>

        {/* Center - Feature Badges (desktop only) */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="ai-badge">
            <Sparkles className="w-3 h-3" />
            GPT-5
          </div>
          <div className="ai-badge">
            <Zap className="w-3 h-3" />
            Gemini
          </div>
          <Badge variant="outline" className="gap-1 text-[9px] border-warning/30 text-warning">
            <Crown className="w-3 h-3" />
            Enterprise
          </Badge>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Desktop status indicators */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/40">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span className="text-success font-medium">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-success" />
              <span className="text-muted-foreground text-[10px]">v4.2</span>
            </div>
          </div>
          
          {/* Keyboard shortcuts hint - desktop only */}
          <InsightTooltip hint={FEATURE_TOOLTIPS['keyboard-shortcuts']} side="bottom">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
                window.dispatchEvent(event);
              }}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="text-[10px]">⇧?</span>
            </Button>
          </InsightTooltip>

          <ThemeSelector />

          {/* Status dot - always visible */}
          <div className="flex items-center gap-1.5">
            <div className="status-dot bg-success" />
            <span className="text-[10px] font-medium text-success hidden sm:inline">Live</span>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-8 w-8 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-14 inset-x-0 bg-card/98 backdrop-blur-xl border-b border-border/40 shadow-xl z-40 animate-fade-in">
          <div className="px-4 py-3 space-y-3">
            {/* Feature badges on mobile */}
            <div className="flex flex-wrap gap-2">
              <div className="ai-badge">
                <Sparkles className="w-3 h-3" />
                GPT-5
              </div>
              <div className="ai-badge">
                <Zap className="w-3 h-3" />
                Gemini
              </div>
              <Badge variant="outline" className="gap-1 text-[9px] border-warning/30 text-warning">
                <Crown className="w-3 h-3" />
                Enterprise
              </Badge>
            </div>

            {/* Status indicators on mobile */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/40">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span className="text-success font-medium">Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-success" />
                <span className="text-muted-foreground text-[10px]">v4.2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
