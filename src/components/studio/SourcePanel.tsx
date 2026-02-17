import { useCallback, useState, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, X, CheckCircle, AlertCircle, Video, 
  FileVideo, Zap, Crown, Aperture, Target, Tv, Globe, Play,
  Layers, Camera, Package, Mountain, Film, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InsightTooltip, { FEATURE_TOOLTIPS } from './InsightTooltip';
import AutoShowTooltip from './AutoShowTooltip';
import { 
  VIDEO_FORMATS, 
  detectVideoFormat, 
  getDropzoneAccept,
  getToolsForFormat,
  type VideoFormat 
} from '@/lib/formats';

interface SourcePanelProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  fileContent: string | null;
  disabled?: boolean;
  onFormatDetected?: (format: VideoFormat | null) => void;
}

const formatIcons: Record<string, React.ReactNode> = {
  film: <Film className="w-5 h-5" />,
  clapperboard: <FileVideo className="w-5 h-5" />,
  crown: <Crown className="w-5 h-5" />,
  video: <Video className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  play: <Play className="w-5 h-5" />,
  tv: <Tv className="w-5 h-5" />,
  globe: <Globe className="w-5 h-5" />,
  'file-video': <FileVideo className="w-5 h-5" />,
  package: <Package className="w-5 h-5" />,
  aperture: <Aperture className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  camera: <Camera className="w-5 h-5" />,
  layers: <Layers className="w-5 h-5" />,
  mountain: <Mountain className="w-5 h-5" />,
};

export default function SourcePanel({ file, onFileChange, fileContent, disabled, onFormatDetected }: SourcePanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<VideoFormat | null>(null);

  const acceptConfig = useMemo(() => getDropzoneAccept(), []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    setDetectedFormat(null);
    
    if (rejectedFiles.length > 0) {
      setError('Unsupported file format. Please upload a video or timeline file.');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      const format = detectVideoFormat(f);
      
      if (!format) {
        const ext = f.name.split('.').pop()?.toLowerCase();
        const videoExts = ['mov', 'mp4', 'avi', 'mkv', 'webm', 'mxf', 'wmv', 'flv', '3gp', '3g2', 'ts', 'mts', 'm2ts', 'vob', 'ogv', 'f4v', 'asf', 'divx', 'dv', 'rm', 'rmvb', 'm4v', 'mpg', 'mpeg'];
        const audioExts = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma'];
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'];
        if (f.type.startsWith('video/') || videoExts.includes(ext || '') || f.type.startsWith('audio/') || audioExts.includes(ext || '') || f.type.startsWith('image/') || imageExts.includes(ext || '')) {
          const mp4Format = VIDEO_FORMATS.find(v => v.id === 'mp4') || null;
          setDetectedFormat(mp4Format);
          onFileChange(f);
          onFormatDetected?.(mp4Format);
        } else {
          setError('Unsupported file type. Please upload a video, audio, or image file.');
        }
        return;
      }
      
      setDetectedFormat(format);
      onFileChange(f);
      onFormatDetected?.(format);
    }
  }, [onFileChange, onFormatDetected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptConfig,
    maxFiles: 1,
    disabled,
  });

  const fileInfo = useMemo(() => {
    if (!file) return null;
    
    const format = detectedFormat;
    const tools = format ? getToolsForFormat(format.id) : [];
    
    if (format?.category === 'timeline' && fileContent) {
      return {
        ...parseTimelineInfo(fileContent),
        format,
        tools,
        isTimeline: true,
      };
    }
    
    return {
      format,
      tools,
      fileSize: formatFileSize(file.size),
      isTimeline: false,
    };
  }, [file, fileContent, detectedFormat]);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setDetectedFormat(null);
    onFormatDetected?.(null);
  };

  const categoryColors: Record<string, string> = {
    professional: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    raw: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    timeline: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    consumer: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    web: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="panel h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/5 via-accent/3 to-transparent rounded-full blur-3xl" />
      
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Video className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Source Media</span>
          <AutoShowTooltip 
            hint={FEATURE_TOOLTIPS['source-upload']} 
            side="right"
            priority={0}
            showDelay={1000}
            hideDelay={7000}
          >
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
          </AutoShowTooltip>
        </div>
        {file && detectedFormat && (
          <div className="flex items-center gap-2">
            <InsightTooltip hint={FEATURE_TOOLTIPS['source-format']} side="left">
              <Badge variant="outline" className={cn('text-[9px] px-2 py-0.5 cursor-help', categoryColors[detectedFormat.category])}>
                {detectedFormat.category.toUpperCase()}
              </Badge>
            </InsightTooltip>
            <div className="flex items-center gap-1.5 text-success">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Ready</span>
            </div>
          </div>
        )}
      </div>
       
      <div className="p-4 relative">
        <div
          {...getRootProps()}
          className={cn(
            'upload-zone min-h-[160px] flex items-center justify-center cursor-pointer group transition-all duration-300',
            isDragActive && 'upload-zone-active',
            disabled && 'opacity-50 cursor-not-allowed',
            file && detectedFormat && 'border-primary/40 bg-gradient-to-br from-primary/[0.03] to-accent/[0.02]'
          )}
        >
          <input {...getInputProps()} />
           
          {file && fileInfo ? (
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10 flex-shrink-0">
                    {detectedFormat ? formatIcons[detectedFormat.icon] || <FileVideo className="w-5 h-5 text-primary" /> : <FileVideo className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{fileInfo.fileSize || formatFileSize(file.size)}</span>
                      {detectedFormat && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="text-[10px] font-medium text-primary">
                            {detectedFormat.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRemove} 
                  disabled={disabled} 
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
               
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                {fileInfo.isTimeline && 'clips' in fileInfo ? (
                  <>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-primary">{fileInfo.clips}</p>
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Clips</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-accent">{fileInfo.assets}</p>
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Assets</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold">{fileInfo.version}</p>
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Version</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold text-primary">{detectedFormat?.codec || 'Auto'}</p>
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Codec</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold text-accent">{detectedFormat?.maxResolution || '4K'}</p>
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wide">Max Res</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-sm font-bold text-success">{fileInfo.tools?.length || 0}</p>
                      <p className="text-[9px] uppercase text-muted-foreground tracking-wide">AI Tools</p>
                    </div>
                  </>
                )}
              </div>
               
              {detectedFormat && detectedFormat.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {detectedFormat.features.slice(0, 4).map((feature) => (
                    <Badge 
                      key={feature} 
                      variant="outline" 
                      className="text-[8px] px-1.5 py-0 bg-muted/30 border-border/50"
                    >
                      {feature.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {detectedFormat.features.length > 4 && (
                    <Badge variant="outline" className="text-[8px] px-1.5 py-0 bg-muted/30 border-border/50">
                      +{detectedFormat.features.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <div className={cn(
                'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center transition-all duration-300 border-2 border-dashed',
                isDragActive
                  ? 'bg-primary/20 border-primary scale-110 shadow-lg shadow-primary/20'
                  : 'bg-muted/30 border-border/50 group-hover:border-primary/50 group-hover:bg-primary/5'
              )}>
                <Upload className={cn(
                  'w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300',
                  isDragActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-primary'
                )} />
              </div>
              <p className="text-sm sm:text-base text-foreground font-semibold mb-1">
                {isDragActive ? 'Drop your media here' : 'Import Video or Timeline'}
              </p>
              <p className="text-[11px] text-muted-foreground mb-3">
                Drag & drop or tap to browse
              </p>
              <div className="flex flex-wrap justify-center gap-1">
                {['MOV', 'MP4', 'AVI', 'MKV', 'WebM', 'WMV', 'ProRes', 'HEVC', 'FCPXML', 'RAW'].map((fmt) => (
                  <Badge 
                    key={fmt} 
                    variant="outline" 
                    className="text-[8px] px-1.5 py-0 bg-muted/20 border-border/30 text-muted-foreground"
                  >
                    {fmt}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
         
        {error && (
          <div className="flex items-center gap-1.5 mt-2 text-destructive text-xs">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function parseTimelineInfo(xml: string) {
  const clips = (xml.match(/<(clip|asset-clip|video|audio)/g) || []).length;
  const assets = (xml.match(/<asset /g) || []).length;
  const version = xml.match(/version="([^"]+)"/)?.[1]?.split(' ')[0] || '1.x';
  return { clips, assets, version };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}