import { ReactNode, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lightbulb, Keyboard, Info, Zap, Star, ChevronRight } from 'lucide-react';

export interface TooltipHint {
  id: string;
  title: string;
  description: string;
  tip?: string;
  shortcut?: string;
  category?: 'feature' | 'workflow' | 'pro-tip' | 'keyboard';
  learnMoreUrl?: string;
}

interface InsightTooltipProps {
  children: ReactNode;
  hint: TooltipHint;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  showBadge?: boolean;
  onSeen?: (id: string) => void;
  disabled?: boolean;
  delayDuration?: number;
}

const categoryConfig = {
  feature: {
    icon: Info,
    color: 'text-primary',
    bg: 'bg-primary/10',
    label: 'Feature',
  },
  workflow: {
    icon: Zap,
    color: 'text-accent',
    bg: 'bg-accent/10',
    label: 'Workflow',
  },
  'pro-tip': {
    icon: Star,
    color: 'text-warning',
    bg: 'bg-warning/10',
    label: 'Pro Tip',
  },
  keyboard: {
    icon: Keyboard,
    color: 'text-success',
    bg: 'bg-success/10',
    label: 'Shortcut',
  },
};

export default function InsightTooltip({
  children,
  hint,
  side = 'top',
  align = 'center',
  showBadge = false,
  onSeen,
  disabled = false,
  delayDuration = 300,
}: InsightTooltipProps) {
  const [hasOpened, setHasOpened] = useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  const category = hint.category || 'feature';
  const config = categoryConfig[category];
  const CategoryIcon = config.icon;

  const handleOpenChange = (open: boolean) => {
    if (open && !hasOpened) {
      setHasOpened(true);
      onSeen?.(hint.id);
    }
  };

  return (
    <Tooltip delayDuration={delayDuration} onOpenChange={handleOpenChange}>
      <TooltipTrigger asChild>
        <span className="relative inline-flex">
          {children}
          {showBadge && !hasOpened && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        className="max-w-[280px] p-0 overflow-hidden bg-popover/95 backdrop-blur-xl border-border/50"
      >
        <div className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className={cn('p-1.5 rounded-md', config.bg)}>
              <CategoryIcon className={cn('w-3.5 h-3.5', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{hint.title}</p>
                <Badge variant="outline" className={cn('text-[8px] px-1 py-0', config.color, config.bg)}>
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {hint.description}
              </p>
            </div>
          </div>

          {/* Tip callout */}
          {hint.tip && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border border-border/30">
              <Lightbulb className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {hint.tip}
              </p>
            </div>
          )}

          {/* Keyboard shortcut */}
          {hint.shortcut && (
            <div className="flex items-center gap-2 pt-1">
              <Keyboard className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Shortcut:</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border/50 rounded">
                {hint.shortcut}
              </kbd>
            </div>
          )}

          {/* Learn more link */}
          {hint.learnMoreUrl && (
            <a
              href={hint.learnMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline pt-1"
            >
              Learn more
              <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// Pre-defined tooltips for common features
export const FEATURE_TOOLTIPS: Record<string, TooltipHint> = {
  // Source Panel
  'source-upload': {
    id: 'source-upload',
    title: 'Import Your Media',
    description: 'Drag & drop video files or timeline projects (FCPXML, XML). Supports ProRes, HEVC, RAW, and more.',
    tip: 'For best results, use ProRes or high-quality source footage.',
    category: 'feature',
  },
  'source-format': {
    id: 'source-format',
    title: 'Auto Format Detection',
    description: 'We automatically detect your video format, codec, and resolution to optimize AI processing.',
    category: 'workflow',
  },

  // Style Panel
  'style-presets': {
    id: 'style-presets',
    title: 'Editing Style Presets',
    description: 'Choose a visual style that matches your project. Each style adjusts pacing, transitions, and effects.',
    tip: 'Cinematic works great for narratives, while Social/TikTok is optimized for short-form vertical content.',
    shortcut: '1',
    category: 'feature',
  },
  'ai-model': {
    id: 'ai-model',
    title: 'AI Processing Engine',
    description: 'Select the AI model for processing. Premium models offer better quality but take longer.',
    tip: 'GPT-5 excels at complex edits, while Gemini Flash is faster for simple projects.',
    category: 'pro-tip',
  },

  // Color Panel
  'color-lut': {
    id: 'color-lut',
    title: 'Cinematic LUT Library',
    description: 'Professional Look-Up Tables for instant color grading. Click any LUT to preview it on your footage.',
    tip: 'Double-click any slider label to reset it to the LUT default.',
    shortcut: '2',
    category: 'feature',
  },
  'color-wheels': {
    id: 'color-wheels',
    title: 'Color Wheels',
    description: 'Fine-tune Lift (shadows), Gamma (midtones), and Gain (highlights) for precise color control.',
    tip: 'Drag from center for subtle adjustments, or near the edge for stronger color shifts.',
    category: 'pro-tip',
  },

  // Effects Panel
  'effects-presets': {
    id: 'effects-presets',
    title: 'Motion Effects',
    description: 'Add transitions, motion blur, and dynamic effects. Toggle individual effects on/off.',
    shortcut: '3',
    category: 'feature',
  },

  // Export Panel
  'export-format': {
    id: 'export-format',
    title: 'Export Formats',
    description: 'Choose between video formats (MP4, ProRes) or project files (FCPXML, AAF) for your NLE.',
    tip: 'Use FCPXML to continue editing in Final Cut Pro, or MP4 H.264 for web delivery.',
    shortcut: '4',
    category: 'feature',
  },
  'export-generate': {
    id: 'export-generate',
    title: 'Generate AI Edit',
    description: 'Start the AI processing. Your settings will be applied to create a professional edit.',
    tip: 'Processing time depends on file size and selected AI model.',
    category: 'workflow',
  },

  // Output Panel
  'output-save': {
    id: 'output-save',
    title: 'Save Your Edit',
    description: 'Click "Save As" to choose where to save, or "Quick Download" for instant download.',
    tip: 'Project files (FCPXML/XML) can be opened in your favorite NLE for further editing.',
    category: 'workflow',
  },

  // Timeline/Canvas
  'timeline-clips': {
    id: 'timeline-clips',
    title: 'Timeline Editing',
    description: 'Click clips to select, drag to rearrange. Effects are shown as colored badges on each clip.',
    tip: 'Use J/K/L keys for playback control, just like professional NLEs.',
    shortcut: 'J/K/L',
    category: 'keyboard',
  },
  'timeline-playhead': {
    id: 'timeline-playhead',
    title: 'Playhead Navigation',
    description: 'Click anywhere on the timeline to move the playhead. Press Space to play/pause.',
    shortcut: 'Space',
    category: 'keyboard',
  },

  // Beat Engine
  'beat-sync': {
    id: 'beat-sync',
    title: 'Beat Sync Engine',
    description: 'Automatically sync cuts and transitions to the music. Upload audio or enable detection.',
    tip: 'Works best with music that has a clear beat. BPM is auto-detected.',
    category: 'feature',
  },

  // Director Intent
  'director-intent': {
    id: 'director-intent',
    title: 'Director Intent',
    description: 'Guide the AI with creative direction. Choose a mood or describe your vision in natural language.',
    tip: 'Be specific: "Build tension slowly, then release at the chorus" works better than "make it exciting".',
    category: 'pro-tip',
  },

  // Header
  'keyboard-shortcuts': {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press Shift+? to see all available keyboard shortcuts for faster editing.',
    shortcut: '⇧?',
    category: 'keyboard',
  },

  // General
  'undo-redo': {
    id: 'undo-redo',
    title: 'Undo & Redo',
    description: 'Made a mistake? Use Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo.',
    shortcut: '⌘Z / ⌘⇧Z',
    category: 'keyboard',
  },
  'auto-save': {
    id: 'auto-save',
    title: 'Auto-Save',
    description: 'Your work is automatically saved every 30 seconds. A recovery banner appears if you have unsaved changes.',
    shortcut: '⌘S',
    category: 'workflow',
  },
};
