import { RotateCcw, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDraftAge } from '@/hooks/useAutoSave';

interface DraftRecoveryBannerProps {
  savedAt: number;
  fileName?: string;
  onRestore: () => void;
  onDiscard: () => void;
  onDismiss: () => void;
}

export default function DraftRecoveryBanner({ 
  savedAt, 
  fileName, 
  onRestore, 
  onDiscard, 
  onDismiss 
}: DraftRecoveryBannerProps) {
  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-card border border-primary/30 rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in slide-in-from-top-4 duration-300">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Unsaved draft found</p>
          <p className="text-xs text-muted-foreground truncate">
            {fileName ? `"${fileName}"` : 'Project'} saved {formatDraftAge(savedAt)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDiscard}
            className="text-xs h-8"
          >
            Discard
          </Button>
          <Button 
            size="sm" 
            onClick={onRestore}
            className="text-xs h-8 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
