import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Upload,
  X,
  Film,
  Search,
  Grid3X3,
  List,
  Plus,
  Trash2,
  Clock,
  FileVideo,
  Music,
  Image,
  GripVertical,
  Play,
  CheckCircle,
  Layers,
  SortAsc,
  FolderOpen,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface MediaClip {
  id: string;
  file: File;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration: number;
  thumbnail?: string;
  addedAt: Date;
  selected: boolean;
}

interface ClipLibraryProps {
  clips: MediaClip[];
  onClipsChange: (clips: MediaClip[]) => void;
  onClipSelect: (clipId: string) => void;
  onAddToTimeline: (clipIds: string[]) => void;
  disabled?: boolean;
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

export default function ClipLibrary({
  clips,
  onClipsChange,
  onClipSelect,
  onAddToTimeline,
  disabled,
}: ClipLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'duration'>('date');

  // Generate thumbnail for video
  const generateThumbnail = useCallback(async (file: File): Promise<string | undefined> => {
    if (!file.type.startsWith('video/')) return undefined;

    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.muted = true;
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(undefined);
        }
        URL.revokeObjectURL(url);
        video.remove();
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(undefined);
      };

      video.load();
    });
  }, []);

  // Get video/audio duration
  const getMediaDuration = useCallback(async (file: File): Promise<number> => {
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      return 5; // Default for images
    }

    return new Promise((resolve) => {
      const el = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
      const url = URL.createObjectURL(file);
      el.src = url;
      el.preload = 'metadata';

      el.onloadedmetadata = () => {
        resolve(el.duration || 0);
        URL.revokeObjectURL(url);
        el.remove();
      };

      el.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };

      el.load();
    });
  }, []);

  // Handle file drops
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newClips: MediaClip[] = [];

    for (const file of acceptedFiles) {
      let type: 'video' | 'audio' | 'image' = 'video';
      if (file.type.startsWith('audio/')) type = 'audio';
      else if (file.type.startsWith('image/')) type = 'image';

      const [duration, thumbnail] = await Promise.all([
        getMediaDuration(file),
        generateThumbnail(file),
      ]);

      newClips.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        type,
        duration,
        thumbnail,
        addedAt: new Date(),
        selected: false,
      });
    }

    onClipsChange([...clips, ...newClips]);
  }, [clips, onClipsChange, generateThumbnail, getMediaDuration]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.mxf'],
      'audio/*': ['.mp3', '.wav', '.aac', '.m4a', '.flac'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    },
    disabled,
    multiple: true,
  });

  // Filter and sort clips
  const filteredClips = useMemo(() => {
    let result = clips;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(query));
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return b.duration - a.duration;
        case 'date':
        default:
          return b.addedAt.getTime() - a.addedAt.getTime();
      }
    });

    return result;
  }, [clips, searchQuery, sortBy]);

  const selectedClips = clips.filter(c => c.selected);

  const toggleClipSelection = (clipId: string) => {
    onClipsChange(clips.map(c => 
      c.id === clipId ? { ...c, selected: !c.selected } : c
    ));
  };

  const selectAll = () => {
    onClipsChange(clips.map(c => ({ ...c, selected: true })));
  };

  const deselectAll = () => {
    onClipsChange(clips.map(c => ({ ...c, selected: false })));
  };

  const removeSelected = () => {
    onClipsChange(clips.filter(c => !c.selected));
  };

  const removeClip = (clipId: string) => {
    onClipsChange(clips.filter(c => c.id !== clipId));
  };

  const getTypeIcon = (type: 'video' | 'audio' | 'image') => {
    switch (type) {
      case 'video':
        return <Film className="w-3 h-3" />;
      case 'audio':
        return <Music className="w-3 h-3" />;
      case 'image':
        return <Image className="w-3 h-3" />;
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Clip Library</span>
          <Badge variant="outline" className="text-[9px]">{clips.length} clips</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-6 w-6 p-0', viewMode === 'grid' && 'bg-primary/20')}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-6 w-6 p-0', viewMode === 'list' && 'bg-primary/20')}
            onClick={() => setViewMode('list')}
          >
            <List className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3 flex-1 flex flex-col">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-border/50 hover:border-primary/50 hover:bg-muted/30',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            'w-6 h-6 mx-auto mb-2',
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          )} />
          <p className="text-xs font-medium">
            {isDragActive ? 'Drop clips here' : 'Drop multiple clips or click to upload'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Video, Audio, Images
          </p>
        </div>

        {/* Search & Actions */}
        {clips.length > 0 && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search clips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <SortAsc className="w-3 h-3" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Date Added
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  <FileVideo className="w-3.5 h-3.5 mr-2" />
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('duration')}>
                  <Clock className="w-3.5 h-3.5 mr-2" />
                  Duration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Selection Actions */}
        {selectedClips.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium flex-1">
              {selectedClips.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onAddToTimeline(selectedClips.map(c => c.id))}
            >
              <Plus className="w-3 h-3" />
              Add to Timeline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
              onClick={removeSelected}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={deselectAll}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Clips Grid/List */}
        <ScrollArea className="flex-1">
          {clips.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">No clips added yet</p>
              <p className="text-[10px] text-muted-foreground/60">
                Upload videos, audio, or images to start editing
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-2 pr-2">
              {filteredClips.map((clip) => (
                <div
                  key={clip.id}
                  className={cn(
                    'group relative rounded-lg border overflow-hidden cursor-pointer transition-all',
                    clip.selected
                      ? 'border-primary ring-1 ring-primary/50 bg-primary/5'
                      : 'border-border/50 hover:border-primary/50'
                  )}
                  onClick={() => toggleClipSelection(clip.id)}
                  onDoubleClick={() => onClipSelect(clip.id)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted/50 relative">
                    {clip.thumbnail ? (
                      <img
                        src={clip.thumbnail}
                        alt={clip.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getTypeIcon(clip.type)}
                      </div>
                    )}
                    {/* Duration badge */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                      {formatDuration(clip.duration)}
                    </div>
                    {/* Selection checkbox */}
                    {clip.selected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-2">
                    <p className="text-[10px] font-medium truncate">{clip.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[8px] px-1 py-0 gap-0.5">
                        {getTypeIcon(clip.type)}
                        {clip.type}
                      </Badge>
                      <span className="text-[8px] text-muted-foreground">
                        {formatFileSize(clip.file.size)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 pr-2">
              {filteredClips.map((clip) => (
                <div
                  key={clip.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all',
                    clip.selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/50 hover:border-primary/50 hover:bg-muted/30'
                  )}
                  onClick={() => toggleClipSelection(clip.id)}
                  onDoubleClick={() => onClipSelect(clip.id)}
                >
                  <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                  {/* Thumbnail */}
                  <div className="w-12 h-8 rounded bg-muted/50 overflow-hidden flex-shrink-0">
                    {clip.thumbnail ? (
                      <img src={clip.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getTypeIcon(clip.type)}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{clip.name}</p>
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                      <span>{formatDuration(clip.duration)}</span>
                      <span>•</span>
                      <span>{formatFileSize(clip.file.size)}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClip(clip.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        {clips.length > 0 && (
          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs gap-1"
              onClick={() => onAddToTimeline(clips.map(c => c.id))}
              disabled={clips.length === 0}
            >
              <Plus className="w-3 h-3" />
              Add All to Timeline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
