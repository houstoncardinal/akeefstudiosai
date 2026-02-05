 import { useCallback, useState } from 'react';
 import { useDropzone } from 'react-dropzone';
 import { Upload, FileVideo, X, AlertCircle, FileCode, CheckCircle } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { Button } from '@/components/ui/button';
 
 interface UploadPanelProps {
   file: File | null;
   onFileChange: (file: File | null) => void;
   disabled?: boolean;
   fileContent: string | null;
 }
 
 export default function UploadPanel({ file, onFileChange, disabled, fileContent }: UploadPanelProps) {
   const [error, setError] = useState<string | null>(null);
 
   const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
     setError(null);
     
     if (rejectedFiles.length > 0) {
       setError('Invalid file type. Only .fcpxml files are accepted.');
       return;
     }
     
     if (acceptedFiles.length > 0) {
       const uploadedFile = acceptedFiles[0];
       if (!uploadedFile.name.toLowerCase().endsWith('.fcpxml')) {
         setError('Invalid file extension. Expected .fcpxml');
         return;
       }
       onFileChange(uploadedFile);
     }
   }, [onFileChange]);
 
   const { getRootProps, getInputProps, isDragActive } = useDropzone({
     onDrop,
     accept: {
       'application/xml': ['.fcpxml'],
       'text/xml': ['.fcpxml'],
     },
     maxFiles: 1,
     disabled,
   });
 
   const removeFile = (e: React.MouseEvent) => {
     e.stopPropagation();
     onFileChange(null);
     setError(null);
   };
 
   // Parse basic info from FCPXML
   const fileInfo = fileContent ? parseBasicInfo(fileContent) : null;
 
   return (
     <div className="panel">
       <div className="panel-header">
         <span className="panel-title">Source Media</span>
         {file && (
           <div className="flex items-center gap-2">
             <CheckCircle className="w-3.5 h-3.5 text-success" />
             <span className="text-xs text-success">Ready</span>
           </div>
         )}
       </div>
       
       <div className="p-4">
         <div
           {...getRootProps()}
           className={cn(
             'upload-zone min-h-[180px] flex flex-col items-center justify-center',
             isDragActive && 'upload-zone-active',
             disabled && 'opacity-50 cursor-not-allowed',
             file && 'border-primary/30'
           )}
         >
           <input {...getInputProps()} />
           
           {file ? (
             <div className="w-full space-y-4">
               <div className="flex items-start justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
                     <FileCode className="w-7 h-7 text-primary" />
                   </div>
                   <div>
                     <p className="font-medium text-foreground text-sm">{file.name}</p>
                     <p className="text-xs text-muted-foreground mt-0.5">
                       {(file.size / 1024).toFixed(1)} KB • FCPXML Project
                     </p>
                   </div>
                 </div>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={removeFile}
                   disabled={disabled}
                   className="text-muted-foreground hover:text-destructive h-8 w-8"
                 >
                   <X className="w-4 h-4" />
                 </Button>
               </div>
               
               {/* File info grid */}
               {fileInfo && (
                 <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                   <div className="text-center">
                     <p className="text-lg font-semibold text-primary">{fileInfo.clipCount}</p>
                     <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Clips</p>
                   </div>
                   <div className="text-center">
                     <p className="text-lg font-semibold text-accent">{fileInfo.assetCount}</p>
                     <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Assets</p>
                   </div>
                   <div className="text-center">
                     <p className="text-lg font-semibold text-foreground">{fileInfo.version}</p>
                     <p className="text-[10px] uppercase tracking-wider text-muted-foreground">FCP Ver</p>
                   </div>
                 </div>
               )}
             </div>
           ) : (
             <div className="text-center">
               <div className={cn(
                 'w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center transition-all',
                 isDragActive 
                   ? 'bg-primary/20 border-2 border-primary scale-110' 
                   : 'bg-muted/50 border border-border/50'
               )}>
                 <Upload className={cn(
                   'w-8 h-8 transition-colors',
                   isDragActive ? 'text-primary' : 'text-muted-foreground'
                 )} />
               </div>
               <p className="text-foreground font-medium mb-1">
                 {isDragActive ? 'Drop your FCPXML here' : 'Import FCPXML Project'}
               </p>
               <p className="text-xs text-muted-foreground">
                 Drag & drop or click to browse • Final Cut Pro X format
               </p>
             </div>
           )}
         </div>
         
         {error && (
           <div className="flex items-center gap-2 mt-3 text-destructive text-xs">
             <AlertCircle className="w-3.5 h-3.5" />
             {error}
           </div>
         )}
       </div>
     </div>
   );
 }
 
 function parseBasicInfo(xml: string) {
   try {
     const clipMatches = xml.match(/<(clip|asset-clip|video|audio)/g) || [];
     const assetMatches = xml.match(/<asset /g) || [];
     const versionMatch = xml.match(/version="([^"]+)"/);
     
     return {
       clipCount: clipMatches.length,
       assetCount: assetMatches.length,
       version: versionMatch?.[1]?.split(' ')[0] || '1.x',
     };
   } catch {
     return { clipCount: 0, assetCount: 0, version: '?' };
   }
 }