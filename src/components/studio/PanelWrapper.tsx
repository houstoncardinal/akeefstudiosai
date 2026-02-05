import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PanelWrapperProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
}

export default function PanelWrapper({ children, title, icon }: PanelWrapperProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const content = <>{children}</>;

  return (
    <div className="relative h-full">
      {/* Fullscreen toggle button */}
      <div className="absolute top-2 right-2 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-40 hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm border border-border/30"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">Expand to fullscreen</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {isFullscreen ? (
        <Dialog open onOpenChange={setIsFullscreen}>
          <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 flex flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/30 flex-shrink-0">
              <DialogTitle className="flex items-center gap-2 text-lg">
                {icon}
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Press Escape or click X to return to normal view
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto p-6">
              {content}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        content
      )}
    </div>
  );
}
