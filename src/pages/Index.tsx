 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import UploadZone from '@/components/dashboard/UploadZone';
 import ProcessingStatus from '@/components/dashboard/ProcessingStatus';
 import JobOutput from '@/components/dashboard/JobOutput';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { useToast } from '@/hooks/use-toast';
 import { EDIT_PRESETS, AI_MODELS } from '@/lib/presets';
 import { Sparkles, Zap, Info } from 'lucide-react';
 import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
 
 type ProcessingState = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
 
 interface JobData {
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
 }
 
 export default function Index() {
   const { user } = useAuth();
   const { toast } = useToast();
 
   // Form state
   const [file, setFile] = useState<File | null>(null);
   const [model, setModel] = useState(AI_MODELS[0].id);
   const [preset, setPreset] = useState(EDIT_PRESETS[0].id);
   const [styleRules, setStyleRules] = useState(EDIT_PRESETS[0].defaultRules);
 
   // Processing state
   const [processingState, setProcessingState] = useState<ProcessingState>('idle');
   const [progress, setProgress] = useState(0);
   const [statusMessage, setStatusMessage] = useState('');
 
   // Output state
   const [currentJob, setCurrentJob] = useState<JobData | null>(null);
   const [outputXml, setOutputXml] = useState<string | null>(null);
 
   // Update style rules when preset changes
   useEffect(() => {
     const selectedPreset = EDIT_PRESETS.find(p => p.id === preset);
     if (selectedPreset) {
       setStyleRules(selectedPreset.defaultRules);
     }
   }, [preset]);
 
   const handleGenerate = async () => {
     if (!file || !user) return;
 
     try {
       // Reset state
       setProcessingState('uploading');
       setProgress(10);
       setCurrentJob(null);
       setOutputXml(null);
       setStatusMessage('Uploading file...');
 
       // Read file content
       const fileContent = await file.text();
       setProgress(30);
 
       // Upload to storage
       const inputPath = `${user.id}/${Date.now()}_${file.name}`;
       const { error: uploadError } = await supabase.storage
         .from('fcpxml-files')
         .upload(inputPath, file);
 
       if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
       setProgress(50);
 
       // Call edge function
       setProcessingState('processing');
       setStatusMessage('AI is analyzing your timeline...');
       setProgress(60);
 
       const { data: fnData, error: fnError } = await supabase.functions.invoke('process-fcpxml', {
         body: {
           fileContent,
           fileName: file.name,
           inputPath,
           preset,
           model,
           styleRules,
         },
       });
 
       if (fnError) {
         // Check for rate limit or payment errors
         if (fnError.message?.includes('429') || fnError.message?.includes('rate limit')) {
           throw new Error('Rate limit exceeded. Please try again later.');
         }
         if (fnError.message?.includes('402') || fnError.message?.includes('payment')) {
           throw new Error('AI usage limit reached. Please add credits.');
         }
         throw new Error(fnError.message);
       }
 
       if (!fnData?.success) {
         throw new Error(fnData?.error || 'Processing failed');
       }
 
       setProgress(100);
       setProcessingState('completed');
       setStatusMessage('Processing complete!');
       setCurrentJob(fnData.job);
       setOutputXml(fnData.outputXml);
 
       toast({ title: 'Success!', description: 'Your AI rough cut is ready for download.' });
 
     } catch (err) {
       console.error('Processing error:', err);
       setProcessingState('failed');
       setStatusMessage(err instanceof Error ? err.message : 'An error occurred');
       toast({
         variant: 'destructive',
         title: 'Processing failed',
         description: err instanceof Error ? err.message : 'Unknown error',
       });
     }
   };
 
   const isProcessing = processingState === 'uploading' || processingState === 'processing';
   const canGenerate = file && !isProcessing;
 
   return (
     <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
       {/* Header */}
       <div>
         <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
           AI Rough Cut Generator
           <Sparkles className="w-7 h-7 text-primary" />
         </h1>
         <p className="text-muted-foreground mt-2">
           Upload your FCPXML, choose an edit style, and let AI create your rough cut
         </p>
       </div>
 
       {/* Main form */}
       <Card className="glass-card">
         <CardHeader>
           <CardTitle className="text-lg">Upload & Configure</CardTitle>
           <CardDescription>
             Upload your Final Cut Pro XML and configure the AI edit settings
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-6">
           {/* Upload zone */}
           <div className="space-y-2">
             <Label>FCPXML File</Label>
             <UploadZone file={file} onFileChange={setFile} disabled={isProcessing} />
           </div>
 
           {/* Model & Preset selectors */}
           <div className="grid md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <Label>AI Model</Label>
                 <Tooltip>
                   <TooltipTrigger>
                     <Info className="w-3.5 h-3.5 text-muted-foreground" />
                   </TooltipTrigger>
                   <TooltipContent>
                     <p className="max-w-xs">Choose the AI model for processing. Gemini 3 Flash is recommended for speed.</p>
                   </TooltipContent>
                 </Tooltip>
               </div>
               <Select value={model} onValueChange={setModel} disabled={isProcessing}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {AI_MODELS.map((m) => (
                     <SelectItem key={m.id} value={m.id}>
                       <div className="flex flex-col">
                         <span>{m.name}</span>
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
 
             <div className="space-y-2">
               <Label>Edit Preset</Label>
               <Select value={preset} onValueChange={setPreset} disabled={isProcessing}>
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {EDIT_PRESETS.map((p) => (
                     <SelectItem key={p.id} value={p.id}>
                       <div className="flex flex-col">
                         <span>{p.name}</span>
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           {/* Preset description */}
           <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
             <p className="text-sm text-muted-foreground">
               {EDIT_PRESETS.find(p => p.id === preset)?.description}
             </p>
           </div>
 
           {/* Style rules */}
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label>Style Rules</Label>
               <span className="text-xs text-muted-foreground">Customize the AI edit instructions</span>
             </div>
             <Textarea
               value={styleRules}
               onChange={(e) => setStyleRules(e.target.value)}
               rows={6}
               className="font-mono text-sm resize-none"
               placeholder="Enter your custom editing rules..."
               disabled={isProcessing}
             />
           </div>
 
           {/* Processing status */}
           <ProcessingStatus
             status={processingState}
             progress={progress}
             message={statusMessage}
           />
 
           {/* Generate button */}
           <Button
             size="lg"
             onClick={handleGenerate}
             disabled={!canGenerate}
             className="w-full gap-2 glow-primary-hover text-base"
           >
             <Zap className="w-5 h-5" />
             {isProcessing ? 'Processing...' : 'Generate AI Rough Cut'}
           </Button>
         </CardContent>
       </Card>
 
       {/* Output section */}
       {currentJob && (
         <JobOutput job={currentJob} outputXml={outputXml} />
       )}
     </div>
   );
 }
