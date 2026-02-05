import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Volume2, Film, Wand2, FileVideo } from 'lucide-react';
import { type VideoFormat } from '@/lib/formats';

interface TimelinePanelProps {
  fileContent: string | null;
  isProcessing: boolean;
  detectedFormat?: VideoFormat | null;
}

export default function TimelinePanel({ fileContent, isProcessing, detectedFormat }: TimelinePanelProps) {
  const isVideoFile = detectedFormat && detectedFormat.category !== 'timeline';
  
  const clips = useMemo(() => {
    if (isVideoFile) {
      return Array.from({ length: 5 }, (_, i) => ({
        start: i * 20,
        duration: 18,
      }));
    }
    
    if (!fileContent) return [];
    const matches = fileContent.match(/<(clip|asset-clip)[^>]*>/g) || [];
    let pos = 0;
    return matches.slice(0, 10).map((_, i) => {
      const dur = 8 + Math.random() * 12;
      const clip = { start: pos, duration: Math.min(dur, 100 - pos) };
      pos += dur + 0.5;
      return clip;
    });
  }, [fileContent, isVideoFile]);

  const waveform = useMemo(() => Array.from({ length: 50 }, () => 20 + Math.random() * 60), []);

  if (!fileContent && !isVideoFile) {
    return (
      <div className="panel h-full relative overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Timeline Preview</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-[160px] text-center">
          <div className="w-12 h-12 rounded-full bg-muted/50 border border-border/50 flex items-center justify-center mb-3">
            <Film className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">No media loaded</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Import a video or timeline file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full relative overflow-hidden">
      {isProcessing && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse z-10 pointer-events-none" />
      )}
      
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Timeline Preview</span>
        </div>
        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-1.5 text-primary">
              <Wand2 className="w-3 h-3 animate-spin" />
              <span className="text-[9px] font-medium uppercase tracking-wider">AI Processing</span>
            </div>
          )}
          {isVideoFile && detectedFormat && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <FileVideo className="w-3 h-3 text-primary" />
              <span className="text-[9px] text-primary font-medium">{detectedFormat.codec}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/40">
            <div className={cn('w-1.5 h-1.5 rounded-full', isProcessing ? 'bg-primary animate-pulse' : 'bg-success')} />
            <span className="text-[9px] text-muted-foreground font-mono">{isVideoFile ? 'Video' : `${clips.length} clips`}</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Timecode ruler */}
        <div className="flex text-[8px] text-muted-foreground uppercase font-mono">
          {['00:00', '00:30', '01:00', '01:30', '02:00'].map((t, i) => (
            <div key={i} className="flex-1 text-center relative">
              <span>{t}</span>
              <div className="absolute bottom-0 left-1/2 w-px h-1.5 bg-border/50 transform -translate-x-1/2" />
            </div>
          ))}
        </div>
         
        {/* Video track V1 */}
        <div className="flex items-center gap-2">
          <div className="w-10 flex items-center gap-1">
            <Film className="w-3 h-3 text-primary/60" />
            <span className="text-[9px] text-muted-foreground font-mono">V1</span>
          </div>
          <div className="flex-1 h-8 rounded bg-muted/40 relative overflow-hidden border border-border/30">
            {clips.map((c, i) => (
              <div
                key={i}
                className={cn(
                  'absolute h-full rounded border-l-2 transition-all duration-300',
                  isProcessing && 'opacity-70',
                  i % 3 === 0 
                    ? 'bg-gradient-to-r from-primary/50 to-primary/30 border-primary' 
                    : i % 3 === 1 
                      ? 'bg-gradient-to-r from-accent/50 to-accent/30 border-accent' 
                      : 'bg-gradient-to-r from-magenta/50 to-magenta/30 border-magenta'
                )}
                style={{ left: `${c.start}%`, width: `${c.duration}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
              </div>
            ))}
            {isProcessing && (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan" />
              </div>
            )}
          </div>
        </div>
         
        {/* Audio track A1 */}
        <div className="flex items-center gap-2">
          <div className="w-10 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-success/60" />
            <span className="text-[9px] text-muted-foreground font-mono">A1</span>
          </div>
          <div className="flex-1 h-6 rounded bg-muted/40 flex items-end px-1 gap-[2px] overflow-hidden border border-border/30">
            {waveform.map((h, i) => (
              <div
                key={i}
                className={cn(
                  'flex-1 min-w-[2px] max-w-[4px] bg-gradient-to-t from-success/60 to-success/30 rounded-t-sm transition-all',
                  isProcessing && 'animate-waveform'
                )}
                style={{ height: `${h}%`, animationDelay: `${i * 0.02}s` }}
              />
            ))}
          </div>
        </div>
         
        {/* Playhead indicator */}
        <div className="relative h-1 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={cn(
              'absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500',
              isProcessing ? 'animate-pulse' : ''
            )} 
            style={{ width: isProcessing ? '60%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}