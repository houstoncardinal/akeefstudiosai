 import { Download, Copy, Check, RotateCcw, FileCode } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { useToast } from '@/hooks/use-toast';
 import { useState } from 'react';
 
 interface OutputPanelProps {
   job: any;
   outputXml: string | null;
   onNewEdit: () => void;
   config: any;
   showOutput: boolean | string;
 }
 
 export default function OutputPanel({ job, outputXml, onNewEdit, config, showOutput }: OutputPanelProps) {
   const { toast } = useToast();
   const [copied, setCopied] = useState(false);
 
   const handleCopy = async () => {
     if (!outputXml) return;
     await navigator.clipboard.writeText(outputXml);
     setCopied(true);
     toast({ title: 'Copied!' });
     setTimeout(() => setCopied(false), 2000);
   };
 
   const handleDownload = () => {
     if (!outputXml) return;
     const blob = new Blob([outputXml], { type: 'application/xml' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = job?.output_filename || 'akeef_export.fcpxml';
     a.click();
     URL.revokeObjectURL(url);
     toast({ title: 'Download started!' });
   };
 
   if (!showOutput) {
     return (
       <div className="panel h-full">
         <div className="panel-header"><span className="panel-title">Output</span></div>
         <div className="p-6 flex flex-col items-center justify-center h-48 text-center">
           <FileCode className="w-10 h-10 text-muted-foreground mb-3" />
           <p className="text-sm text-muted-foreground">Configure your edit and generate</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="panel border-success/30 h-full">
       <div className="panel-header">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
           <span className="panel-title text-success">Export Ready</span>
         </div>
         <Button variant="ghost" size="sm" onClick={onNewEdit} className="h-6 text-[10px]">
           <RotateCcw className="w-3 h-3 mr-1" />New
         </Button>
       </div>
       <div className="p-3 space-y-3">
         <div className="grid grid-cols-2 gap-2">
           <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
             {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
             {copied ? 'Copied' : 'Copy'}
           </Button>
           <Button size="sm" onClick={handleDownload} className="gap-1.5 text-xs bg-gradient-to-r from-success to-primary">
             <Download className="w-3 h-3" />Download
           </Button>
         </div>
         <ScrollArea className="h-40 rounded border border-border/50 bg-background">
           <pre className="p-2 text-[9px] font-mono text-primary/80 leading-relaxed">
             {outputXml?.slice(0, 1500)}...
           </pre>
         </ScrollArea>
       </div>
     </div>
   );
 }