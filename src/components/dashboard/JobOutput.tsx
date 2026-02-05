 import { useState } from 'react';
 import { Download, Copy, Check, FileVideo, Clock, Cpu, Tag, AlertTriangle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { useToast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';
 
 interface JobOutputProps {
   job: {
     id: string;
     input_filename: string;
     output_filename: string | null;
     output_file_path: string | null;
     preset: string;
     model: string;
     status: string;
     error_message: string | null;
     created_at: string;
     completed_at: string | null;
   };
   outputXml: string | null;
 }
 
 export default function JobOutput({ job, outputXml }: JobOutputProps) {
   const { toast } = useToast();
   const [copied, setCopied] = useState(false);
 
   const handleCopy = async () => {
     if (!outputXml) return;
     await navigator.clipboard.writeText(outputXml);
     setCopied(true);
     toast({ title: 'Copied to clipboard' });
     setTimeout(() => setCopied(false), 2000);
   };
 
   const handleDownload = async () => {
     if (!job.output_file_path) return;
     
     try {
       const { data, error } = await supabase.storage
         .from('fcpxml-files')
         .download(job.output_file_path);
       
       if (error) throw error;
       
       const url = URL.createObjectURL(data);
       const a = document.createElement('a');
       a.href = url;
       a.download = job.output_filename || 'output.fcpxml';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       
       toast({ title: 'Download started' });
     } catch (err) {
       toast({
         variant: 'destructive',
         title: 'Download failed',
         description: err instanceof Error ? err.message : 'Unknown error',
       });
     }
   };
 
   const formatDuration = () => {
     if (!job.completed_at) return '-';
     const start = new Date(job.created_at).getTime();
     const end = new Date(job.completed_at).getTime();
     const seconds = Math.round((end - start) / 1000);
     return `${seconds}s`;
   };
 
   const formatPreset = (preset: string) => {
     return preset.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
   };
 
   if (job.status === 'failed') {
     return (
       <Card className="glass-card border-destructive/30 animate-fade-in">
         <CardHeader className="pb-3">
           <CardTitle className="text-lg flex items-center gap-2 text-destructive">
             <AlertTriangle className="w-5 h-5" />
             Processing Failed
           </CardTitle>
         </CardHeader>
         <CardContent>
           <p className="text-muted-foreground">{job.error_message || 'An unknown error occurred'}</p>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="glass-card animate-fade-in">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <CardTitle className="text-lg flex items-center gap-2">
             <FileVideo className="w-5 h-5 text-primary" />
             Output Ready
           </CardTitle>
           <div className="flex items-center gap-2">
             <Button
               variant="outline"
               size="sm"
               onClick={handleCopy}
               disabled={!outputXml}
               className="gap-2"
             >
               {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Copied' : 'Copy XML'}
             </Button>
             <Button
               size="sm"
               onClick={handleDownload}
               disabled={!job.output_file_path}
               className="gap-2 glow-primary-hover"
             >
               <Download className="w-4 h-4" />
               Download FCPXML
             </Button>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Job metadata */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
           <div className="space-y-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <FileVideo className="w-3.5 h-3.5" />
               Input File
             </div>
             <p className="text-sm font-medium truncate">{job.input_filename}</p>
           </div>
           <div className="space-y-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <Tag className="w-3.5 h-3.5" />
               Preset
             </div>
             <p className="text-sm font-medium">{formatPreset(job.preset)}</p>
           </div>
           <div className="space-y-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <Cpu className="w-3.5 h-3.5" />
               Model
             </div>
             <p className="text-sm font-medium">{job.model.split('/').pop()}</p>
           </div>
           <div className="space-y-1">
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
               <Clock className="w-3.5 h-3.5" />
               Processing Time
             </div>
             <p className="text-sm font-medium">{formatDuration()}</p>
           </div>
         </div>
 
         {/* XML Preview */}
         {outputXml && (
           <div className="space-y-2">
             <p className="text-sm font-medium text-muted-foreground">XML Preview</p>
             <ScrollArea className="h-48 w-full">
               <pre className="code-block text-xs leading-relaxed">
                 {outputXml.slice(0, 3000)}
                 {outputXml.length > 3000 && '\n\n... (truncated)'}
               </pre>
             </ScrollArea>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }