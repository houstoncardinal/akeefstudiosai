 import { useState } from 'react';
 import { Download, Copy, Check, FileVideo, Clock, Cpu, Tag, RotateCcw, ExternalLink } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { useToast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';
 
 interface OutputPanelProps {
   job: {
     id: string;
     input_filename: string;
     output_filename: string | null;
     output_file_path: string | null;
     preset: string;
     model: string;
     created_at: string;
     completed_at: string | null;
   };
   outputXml: string;
   onNewEdit: () => void;
 }
 
 export default function OutputPanel({ job, outputXml, onNewEdit }: OutputPanelProps) {
   const { toast } = useToast();
   const [copied, setCopied] = useState(false);
   const [downloading, setDownloading] = useState(false);
 
   const handleCopy = async () => {
     await navigator.clipboard.writeText(outputXml);
     setCopied(true);
     toast({ title: 'Copied to clipboard!' });
     setTimeout(() => setCopied(false), 2000);
   };
 
   const handleDownload = async () => {
     setDownloading(true);
     try {
       // Create blob from XML content
       const blob = new Blob([outputXml], { type: 'application/xml' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = job.output_filename || 'ai_roughcut.fcpxml';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
       
       toast({ title: 'Download started!' });
     } catch (err) {
       toast({
         variant: 'destructive',
         title: 'Download failed',
         description: err instanceof Error ? err.message : 'Unknown error',
       });
     } finally {
       setDownloading(false);
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
 
   return (
     <div className="panel border-success/30 animate-fade-in">
       <div className="panel-header">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
           <span className="panel-title text-success">Export Complete</span>
         </div>
         <Button
           variant="ghost"
           size="sm"
           onClick={onNewEdit}
           className="gap-1.5 text-xs h-7"
         >
           <RotateCcw className="w-3 h-3" />
           New Edit
         </Button>
       </div>
 
       <div className="p-4 space-y-4">
         {/* Quick stats */}
         <div className="grid grid-cols-4 gap-3">
           <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
             <FileVideo className="w-4 h-4 mx-auto mb-1 text-primary" />
             <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Output</p>
             <p className="text-xs font-medium truncate mt-0.5">{job.output_filename?.split('_')[0] || 'ready'}</p>
           </div>
           <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
             <Tag className="w-4 h-4 mx-auto mb-1 text-accent" />
             <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Preset</p>
             <p className="text-xs font-medium truncate mt-0.5">{formatPreset(job.preset).split(' ')[0]}</p>
           </div>
           <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
             <Cpu className="w-4 h-4 mx-auto mb-1 text-magenta" />
             <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Model</p>
             <p className="text-xs font-medium truncate mt-0.5">{job.model.split('/').pop()?.split('-')[0]}</p>
           </div>
           <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
             <Clock className="w-4 h-4 mx-auto mb-1 text-success" />
             <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</p>
             <p className="text-xs font-medium mt-0.5">{formatDuration()}</p>
           </div>
         </div>
 
         {/* XML preview */}
         <div>
           <div className="flex items-center justify-between mb-2">
             <span className="text-xs text-muted-foreground uppercase tracking-wider">XML Preview</span>
             <span className="text-[10px] text-muted-foreground">
               {(outputXml.length / 1024).toFixed(1)} KB
             </span>
           </div>
           <ScrollArea className="h-32 w-full rounded border border-border/50 bg-background">
             <pre className="p-3 text-[11px] font-mono leading-relaxed text-primary/80">
               {outputXml.slice(0, 2000)}
               {outputXml.length > 2000 && '\n\n// ... truncated ...'}
             </pre>
           </ScrollArea>
         </div>
 
         {/* Action buttons */}
         <div className="flex gap-3">
           <Button
             variant="outline"
             onClick={handleCopy}
             className="flex-1 gap-2 h-10"
           >
             {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
             {copied ? 'Copied!' : 'Copy XML'}
           </Button>
           <Button
             onClick={handleDownload}
             disabled={downloading}
             className="flex-1 gap-2 h-10 bg-gradient-to-r from-success to-primary text-primary-foreground hover:opacity-90"
           >
             <Download className="w-4 h-4" />
             Download FCPXML
           </Button>
         </div>
       </div>
     </div>
   );
 }