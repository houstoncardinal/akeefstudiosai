import { Download, Trash2, FolderOpen, Clock, FileVideo, FileCode, Film, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type ExportRecord } from '@/hooks/useExportHistory';

interface ExportsLibraryProps {
  records: ExportRecord[];
  onRedownload: (record: ExportRecord) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getFormatIcon(ext: string) {
  if (['.mp4', '.mov', '.webm', '.avi', '.mxf'].includes(ext)) return FileVideo;
  if (['.fcpxml', '.xml'].includes(ext)) return FileCode;
  if (['.edl', '.aaf'].includes(ext)) return Film;
  return Package;
}

export default function ExportsLibrary({ records, onRedownload, onRemove, onClearAll }: ExportsLibraryProps) {
  if (records.length === 0) {
    return (
      <div className="panel h-full relative overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">My Exports</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-52 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
            <FolderOpen className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No exports yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">
            Your exported files will appear here for quick access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel h-full relative overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">My Exports</span>
          <Badge variant="outline" className="text-[9px] ml-1">{records.length}</Badge>
        </div>
        {records.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-6 text-[9px] gap-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
            Clear All
          </Button>
        )}
      </div>

      <ScrollArea className="h-[400px] sm:h-[500px]">
        <div className="p-2 sm:p-3 space-y-2">
          {records.map((record) => {
            const Icon = getFormatIcon(record.extension);
            const hasContent = !!record.content;
            return (
              <div
                key={record.id}
                className="group rounded-xl border border-border/50 bg-background/80 hover:border-primary/30 transition-all p-3 space-y-2"
              >
                {/* Top row: icon + name + actions */}
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{record.filename}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 bg-muted/50">
                        {record.formatName}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">{formatSize(record.sizeBytes)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {hasContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-60 group-hover:opacity-100"
                        onClick={() => onRedownload(record)}
                        title="Re-download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-40 group-hover:opacity-100 hover:text-destructive"
                      onClick={() => onRemove(record.id)}
                      title="Remove from history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 text-[9px] text-muted-foreground pl-[46px]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(record.createdAt)}</span>
                  </div>
                  {record.style && (
                    <span className="capitalize">{record.style.replace(/_/g, ' ')}</span>
                  )}
                  {record.colorGrade && (
                    <span className="capitalize">{record.colorGrade.replace(/_/g, ' ')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
