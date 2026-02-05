 import { useCallback, useState } from 'react';
 import { useDropzone } from 'react-dropzone';
 import { Upload, FileCode, X, CheckCircle, AlertCircle, Sparkles, Film, Layers, Clock } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 
 interface SourcePanelProps {
   file: File | null;
   onFileChange: (file: File | null) => void;
   fileContent: string | null;
   disabled?: boolean;
 }
 
 export default function SourcePanel({ file, onFileChange, fileContent, disabled }: SourcePanelProps) {
   const [error, setError] = useState<string | null>(null);
 
   const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
     setError(null);
     if (rejectedFiles.length > 0) {
       setError('Invalid file. Only .fcpxml files are accepted.');
       return;
     }
     if (acceptedFiles.length > 0) {
       const f = acceptedFiles[0];
       if (!f.name.toLowerCase().endsWith('.fcpxml')) {
         setError('Invalid extension. Expected .fcpxml');
         return;
       }
       onFileChange(f);
     }
   }, [onFileChange]);
 
   const { getRootProps, getInputProps, isDragActive } = useDropzone({
     onDrop,
     accept: { 'application/xml': ['.fcpxml'], 'text/xml': ['.fcpxml'] },
     maxFiles: 1,
     disabled,
   });
 
   const fileInfo = fileContent ? parseInfo(fileContent) : null;
 
   return (
    <div className="panel h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-2xl" />
      
       <div className="panel-header">
        <div className="flex items-center gap-2">
          <Film className="w-3.5 h-3.5 text-primary" />
          <span className="panel-title">Source Media</span>
        </div>
        {file && (
          <div className="flex items-center gap-1.5 text-success">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">Loaded</span>
          </div>
        )}
       </div>
      <div className="p-4 relative">
         <div
           {...getRootProps()}
           className={cn(
            'upload-zone min-h-[140px] flex items-center justify-center cursor-pointer group',
             isDragActive && 'upload-zone-active',
             disabled && 'opacity-50 cursor-not-allowed',
            file && 'border-primary/40 bg-primary/[0.02]'
           )}
         >
           <input {...getInputProps()} />
           {file ? (
             <div className="w-full space-y-3">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                     <FileCode className="w-5 h-5 text-primary" />
                   </div>
                   <div>
                     <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                     <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                   </div>
                 </div>
                 <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onFileChange(null); }} disabled={disabled} className="h-7 w-7">
                   <X className="w-4 h-4" />
                 </Button>
               </div>
               {fileInfo && (
                 <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                   <div className="text-center">
                     <p className="text-lg font-bold text-primary">{fileInfo.clips}</p>
                     <p className="text-[9px] uppercase text-muted-foreground">Clips</p>
                   </div>
                   <div className="text-center">
                     <p className="text-lg font-bold text-accent">{fileInfo.assets}</p>
                     <p className="text-[9px] uppercase text-muted-foreground">Assets</p>
                   </div>
                   <div className="text-center">
                     <p className="text-lg font-bold">{fileInfo.version}</p>
                     <p className="text-[9px] uppercase text-muted-foreground">Version</p>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="text-center">
               <Upload className={cn('w-10 h-10 mx-auto mb-2', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
               <p className="text-sm font-medium">{isDragActive ? 'Drop here' : 'Import FCPXML'}</p>
               <p className="text-[10px] text-muted-foreground mt-0.5">Drag & drop or click</p>
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
 
 function parseInfo(xml: string) {
   const clips = (xml.match(/<(clip|asset-clip|video|audio)/g) || []).length;
   const assets = (xml.match(/<asset /g) || []).length;
   const version = xml.match(/version="([^"]+)"/)?.[1]?.split(' ')[0] || '1.x';
   return { clips, assets, version };
 }