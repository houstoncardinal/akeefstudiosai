 import { Download, Copy, Check, RotateCcw, FileCode, Sparkles, CheckCircle, Zap } from 'lucide-react';
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
      <div className="panel h-full relative overflow-hidden">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="panel-title">Output</span>
          </div>
        </div>
        <div className="p-6 flex flex-col items-center justify-center h-52 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
            <FileCode className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No output yet</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Configure your edit and click Generate</p>
         </div>
       </div>
     );
   }
 
   return (
    <div className="panel border-success/40 h-full relative overflow-hidden">
      {/* Success glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent pointer-events-none" />
      
       <div className="panel-header">
         <div className="flex items-center gap-2">
          <div className="status-dot bg-success" />
          <span className="panel-title text-success">Ready to Export</span>
         </div>
        <Button variant="ghost" size="sm" onClick={onNewEdit} className="h-7 text-[10px] gap-1.5">
           <RotateCcw className="w-3 h-3 mr-1" />New
         </Button>
       </div>
      <div className="p-4 space-y-4 relative">
        {/* Success banner */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="w-5 h-5 text-success" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-success">AI Edit Complete</p>
            <p className="text-[10px] text-success/70">Your FCPXML is ready for download</p>
          </div>
          <Sparkles className="w-4 h-4 text-success/50" />
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy} 
            className="h-10 gap-2 text-xs border-border/50 hover:border-primary/50 hover:bg-primary/5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
             {copied ? 'Copied' : 'Copy'}
           </Button>
          <Button 
            size="sm" 
            onClick={handleDownload} 
            className="h-10 gap-2 text-xs bg-gradient-to-r from-success to-primary hover:opacity-90 glow-cyan-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download
           </Button>
         </div>
        
        {/* XML Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">XML Preview</span>
            <span className="text-[9px] text-muted-foreground font-mono">{job?.output_filename}</span>
          </div>
          <ScrollArea className="h-36 rounded-lg border border-border/40 bg-background/50">
            <pre className="p-3 text-[9px] font-mono text-primary/70 leading-relaxed">
             {outputXml?.slice(0, 1500)}...
            </pre>
          </ScrollArea>
        </div>
       </div>
     </div>
   );
 }