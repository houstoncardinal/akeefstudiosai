 import { useCallback, useState } from 'react';
 import { useDropzone } from 'react-dropzone';
 import { Upload, FileVideo, X, AlertCircle } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 
 interface UploadZoneProps {
   file: File | null;
   onFileChange: (file: File | null) => void;
   disabled?: boolean;
 }
 
 export default function UploadZone({ file, onFileChange, disabled }: UploadZoneProps) {
   const [error, setError] = useState<string | null>(null);
 
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid video or project file');
      return;
    }
    
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mov', '.mp4', '.avi', '.webm', '.mxf', '.mkv', '.m4v', '.mpg', '.mpeg', '.wmv', '.flv', '.3gp', '.ts'],
      'application/xml': ['.fcpxml', '.xml'],
      'text/xml': ['.fcpxml', '.xml'],
      'application/octet-stream': ['.braw', '.r3d', '.ari', '.fcpxml'],
    },
    maxFiles: 1,
    disabled,
  });
 
   const removeFile = (e: React.MouseEvent) => {
     e.stopPropagation();
     onFileChange(null);
     setError(null);
   };
 
   return (
     <div className="space-y-2">
       <div
         {...getRootProps()}
         className={cn(
           'upload-zone cursor-pointer',
           isDragActive && 'upload-zone-active',
           disabled && 'opacity-50 cursor-not-allowed',
           file && 'border-primary/30 bg-primary/5'
         )}
       >
         <input {...getInputProps()} />
         
         {file ? (
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                 <FileVideo className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <p className="font-medium text-foreground">{file.name}</p>
                 <p className="text-sm text-muted-foreground">
                   {(file.size / 1024).toFixed(1)} KB
                 </p>
               </div>
             </div>
             <Button
               variant="ghost"
               size="icon"
               onClick={removeFile}
               disabled={disabled}
               className="text-muted-foreground hover:text-destructive"
             >
               <X className="w-5 h-5" />
             </Button>
           </div>
         ) : (
            <div className="text-center">
              <Upload className={cn(
                'w-12 h-12 mx-auto mb-4 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )} />
              <p className="text-foreground font-medium mb-1">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your video or project file'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse • MP4, MOV, AVI, MKV, WebM, FCPXML & more
              </p>
            </div>
         )}
       </div>
       
       {error && (
         <div className="flex items-center gap-2 text-destructive text-sm">
           <AlertCircle className="w-4 h-4" />
           {error}
         </div>
       )}
     </div>
   );
 }