import { X, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type ShortcutAction, formatShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsOverlayProps {
  shortcuts: ShortcutAction[];
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  playback: 'Playback',
  edit: 'Editing',
  view: 'View',
  navigation: 'Navigation',
};

export default function KeyboardShortcutsOverlay({ shortcuts, onClose }: KeyboardShortcutsOverlayProps) {
  const grouped = shortcuts.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, ShortcutAction[]>);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-1.5">
                {items.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/50">
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-5 py-3 border-t border-border bg-muted/30 text-center">
          <span className="text-xs text-muted-foreground">
            Press <Badge variant="outline" className="font-mono text-[10px] mx-1">⇧?</Badge> anytime to toggle this overlay
          </span>
        </div>
      </div>
    </div>
  );
}
