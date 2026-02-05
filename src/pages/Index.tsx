 import { useState, useEffect, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { EDIT_PRESETS, AI_MODELS } from '@/lib/presets';
 import Header from '@/components/pro/Header';
 import UploadPanel from '@/components/pro/UploadPanel';
 import PresetPanel from '@/components/pro/PresetPanel';
 import ControlPanel from '@/components/pro/ControlPanel';
 import OutputPanel from '@/components/pro/OutputPanel';
 import TimelineVisualizer from '@/components/pro/TimelineVisualizer';
 import ProcessingOverlay from '@/components/pro/ProcessingOverlay';
 
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
 
 // Generate session ID for rate limiting
 const getSessionId = () => {
   let sessionId = localStorage.getItem('fcpxml_session_id');
   if (!sessionId) {
     sessionId = crypto.randomUUID();
     localStorage.setItem('fcpxml_session_id', sessionId);
   }
   return sessionId;
 };
 
 export default function Index() {
   const { toast } = useToast();
 
   // Form state
   const [file, setFile] = useState<File | null>(null);
   const [fileContent, setFileContent] = useState<string | null>(null);
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
 
   // Parse file when uploaded
   useEffect(() => {
     if (file) {
       file.text().then(setFileContent);
     } else {
       setFileContent(null);
     }
   }, [file]);
 
   // Update style rules when preset changes
   useEffect(() => {
     const selectedPreset = EDIT_PRESETS.find(p => p.id === preset);
     if (selectedPreset) {
       setStyleRules(selectedPreset.defaultRules);
     }
   }, [preset]);
 
   const handleGenerate = async () => {
     if (!file || !fileContent) return;
 
     try {
       setProcessingState('uploading');
       setProgress(15);
       setCurrentJob(null);
       setOutputXml(null);
       setStatusMessage('Preparing your timeline...');
 
       // Simulate upload progress
       const progressInterval = setInterval(() => {
         setProgress(p => Math.min(p + 5, 40));
       }, 200);
 
       setProcessingState('processing');
       setStatusMessage('AI is analyzing clips and applying edits...');
       setProgress(45);
 
       clearInterval(progressInterval);
 
       // Start progress simulation for AI processing
       const aiProgressInterval = setInterval(() => {
         setProgress(p => Math.min(p + 2, 90));
       }, 500);
 
       const { data: fnData, error: fnError } = await supabase.functions.invoke('process-fcpxml', {
         body: {
           fileContent,
           fileName: file.name,
           preset,
           model,
           styleRules,
           sessionId: getSessionId(),
         },
       });
 
       clearInterval(aiProgressInterval);
 
       if (fnError) {
         if (fnError.message?.includes('429') || fnError.message?.includes('rate limit')) {
           throw new Error('Rate limit exceeded. Max 10 jobs per hour. Please wait.');
         }
         if (fnError.message?.includes('402')) {
           throw new Error('AI service temporarily unavailable.');
         }
         throw new Error(fnError.message);
       }
 
       if (!fnData?.success) {
         throw new Error(fnData?.error || 'Processing failed');
       }
 
       setProgress(100);
       setProcessingState('completed');
       setStatusMessage('Your AI rough cut is ready!');
       setCurrentJob(fnData.job);
       setOutputXml(fnData.outputXml);
 
       toast({ 
         title: '✨ Export Complete', 
         description: 'Your AI-edited FCPXML is ready for download.' 
       });
 
     } catch (err) {
       console.error('Processing error:', err);
       setProcessingState('failed');
       setStatusMessage(err instanceof Error ? err.message : 'An error occurred');
       toast({
         variant: 'destructive',
         title: 'Processing Failed',
         description: err instanceof Error ? err.message : 'Unknown error',
       });
     }
   };
 
   const handleReset = () => {
     setProcessingState('idle');
     setProgress(0);
     setStatusMessage('');
     setCurrentJob(null);
     setOutputXml(null);
   };
 
   const isProcessing = processingState === 'uploading' || processingState === 'processing';
   const canGenerate = file && fileContent && !isProcessing;
   const showOutput = processingState === 'completed' && currentJob && outputXml;
 
   return (
     <div className="min-h-screen bg-background noise-overlay">
       <Header />
       
       <main className="container mx-auto px-4 py-6">
         {/* Main grid layout */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
           {/* Left column - Upload & Timeline */}
           <div className="lg:col-span-7 space-y-4">
             <UploadPanel 
               file={file} 
               onFileChange={setFile} 
               disabled={isProcessing}
               fileContent={fileContent}
             />
             
             {fileContent && (
               <TimelineVisualizer 
                 xmlContent={fileContent} 
                 isProcessing={isProcessing}
               />
             )}
             
             {showOutput && (
               <OutputPanel 
                 job={currentJob!} 
                 outputXml={outputXml!}
                 onNewEdit={handleReset}
               />
             )}
           </div>
 
           {/* Right column - Controls */}
           <div className="lg:col-span-5 space-y-4">
             <PresetPanel
               preset={preset}
               onPresetChange={setPreset}
               disabled={isProcessing}
             />
             
             <ControlPanel
               model={model}
               onModelChange={setModel}
               styleRules={styleRules}
               onStyleRulesChange={setStyleRules}
               onGenerate={handleGenerate}
               canGenerate={canGenerate}
               isProcessing={isProcessing}
               processingState={processingState}
               progress={progress}
               statusMessage={statusMessage}
             />
           </div>
         </div>
       </main>
 
       {/* Processing overlay */}
       {isProcessing && (
         <ProcessingOverlay 
           progress={progress} 
           message={statusMessage}
           preset={preset}
         />
       )}
     </div>
   );
 }
