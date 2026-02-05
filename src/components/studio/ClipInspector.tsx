import { 
  X, 
  Palette, 
  Clock, 
  Volume2, 
  Zap, 
  Sparkles, 
  Type,
  Film,
  Music,
  Image,
  Trash2,
  Copy,
  Lock,
  Unlock,
  EyeOff,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ClipEffect {
  id: string;
  type: 'color' | 'transition' | 'speed' | 'audio' | 'graphics' | 'filter';
  name: string;
}

interface SelectedClip {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'title' | 'image';
  start: number;
  duration: number;
  effects: ClipEffect[];
  speed: number;
  volume: number;
  locked: boolean;
  visible: boolean;
}

interface ClipInspectorProps {
  clip: SelectedClip | null;
  onClose: () => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRemoveEffect: (effectId: string) => void;
}

const typeIcons = {
  video: Film,
  audio: Music,
  title: Type,
  image: Image,
};

const effectIcons: Record<string, typeof Palette> = {
  color: Palette,
  transition: Zap,
  speed: Clock,
  audio: Volume2,
  graphics: Type,
  filter: Sparkles,
};

const effectColors: Record<string, string> = {
  color: 'text-amber-500 bg-amber-500/10',
  transition: 'text-purple-500 bg-purple-500/10',
  speed: 'text-blue-500 bg-blue-500/10',
  audio: 'text-green-500 bg-green-500/10',
  graphics: 'text-pink-500 bg-pink-500/10',
  filter: 'text-cyan-500 bg-cyan-500/10',
};

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 24);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

export default function ClipInspector({
  clip,
  onClose,
  onSpeedChange,
  onVolumeChange,
  onToggleLock,
  onToggleVisibility,
  onDelete,
  onDuplicate,
  onRemoveEffect,
}: ClipInspectorProps) {
  if (!clip) return null;

  const TypeIcon = typeIcons[clip.type];

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col h-full animate-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <TypeIcon className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-semibold truncate">{clip.name}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Clip Info */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Timing
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="px-2 py-1.5 rounded-md bg-muted/50">
                <span className="text-muted-foreground">In:</span>
                <span className="font-mono ml-1">{formatTimecode(clip.start)}</span>
              </div>
              <div className="px-2 py-1.5 rounded-md bg-muted/50">
                <span className="text-muted-foreground">Out:</span>
                <span className="font-mono ml-1">{formatTimecode(clip.start + clip.duration)}</span>
              </div>
              <div className="col-span-2 px-2 py-1.5 rounded-md bg-muted/50">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-mono ml-1">{formatTimecode(clip.duration)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Speed Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Speed
              </h4>
              <Badge variant="outline" className="text-[10px] font-mono">
                {Math.round(clip.speed * 100)}%
              </Badge>
            </div>
            <Slider
              value={[clip.speed * 100]}
              min={10}
              max={400}
              step={5}
              onValueChange={([v]) => onSpeedChange(v / 100)}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>0.1x</span>
              <span>1x</span>
              <span>4x</span>
            </div>
          </div>

          {/* Volume Control (for video/audio) */}
          {(clip.type === 'video' || clip.type === 'audio') && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Volume
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {Math.round(clip.volume * 100)}%
                  </Badge>
                </div>
                <Slider
                  value={[clip.volume * 100]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={([v]) => onVolumeChange(v / 100)}
                  className="w-full"
                />
              </div>
            </>
          )}

          <Separator />

          {/* Applied Effects */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Applied Effects ({clip.effects.length})
            </h4>
            {clip.effects.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic">No effects applied</p>
            ) : (
              <div className="space-y-1">
                {clip.effects.map((effect) => {
                  const Icon = effectIcons[effect.type] || Sparkles;
                  return (
                    <div
                      key={effect.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-md group",
                        effectColors[effect.type]
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-xs flex-1 truncate">{effect.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onRemoveEffect(effect.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={onToggleLock}
              >
                {clip.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {clip.locked ? 'Unlock' : 'Lock'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={onToggleVisibility}
              >
                {clip.visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {clip.visible ? 'Hide' : 'Show'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5"
                onClick={onDuplicate}
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
