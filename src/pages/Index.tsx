 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 import { 
   STYLE_PRESETS, 
   COLOR_GRADES, 
   EFFECT_PRESETS, 
   GRAPHICS_TEMPLATES,
   VERSION_TYPES,
   EXPORT_FORMATS,
   AI_MODELS 
 } from '@/lib/presets';
 import Header from '@/components/studio/Header';
 import SourcePanel from '@/components/studio/SourcePanel';
 import TimelinePanel from '@/components/studio/TimelinePanel';
 import StylePanel from '@/components/studio/StylePanel';
 import ColorPanel from '@/components/studio/ColorPanel';
 import EffectsPanel from '@/components/studio/EffectsPanel';
 import GraphicsPanel from '@/components/studio/GraphicsPanel';
 import VersionPanel from '@/components/studio/VersionPanel';
 import ExportPanel from '@/components/studio/ExportPanel';
 import OutputPanel from '@/components/studio/OutputPanel';
 import ProcessingOverlay from '@/components/studio/ProcessingOverlay';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { 
   Palette, 
   Sparkles, 
   Type, 
   Layers, 
   Download,
   Wand2,
   Zap
 } from 'lucide-react';
 
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
 
 interface EditConfig {
   style: string;
   colorGrade: string;
   effectPreset: string;
   graphics: string[];
   versions: string[];
   exportFormat: string;
   model: string;
   customRules: string;
 }
 
 const getSessionId = () => {
   let sessionId = localStorage.getItem('akeef_session_id');
   if (!sessionId) {
     sessionId = crypto.randomUUID();
     localStorage.setItem('akeef_session_id', sessionId);
   }
   return sessionId;
 };
 
 export default function Index() {
   const { toast } = useToast();
 
   // File state
   const [file, setFile] = useState<File | null>(null);
   const [fileContent, setFileContent] = useState<string | null>(null);
 
   // Edit configuration
   const [config, setConfig] = useState<EditConfig>({
     style: STYLE_PRESETS[0].id,
     colorGrade: COLOR_GRADES[0].id,
     effectPreset: EFFECT_PRESETS[1].id, // Cinematic as default
     graphics: [],
     versions: ['rough_cut'],
     exportFormat: EXPORT_FORMATS[0].id,
     model: AI_MODELS[0].id,
     customRules: STYLE_PRESETS[0].defaultRules,
   });
 
   // Processing state
   const [processingState, setProcessingState] = useState<ProcessingState>('idle');
   const [progress, setProgress] = useState(0);
   const [statusMessage, setStatusMessage] = useState('');
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
 
   // Update custom rules when style changes
   useEffect(() => {
     const selectedStyle = STYLE_PRESETS.find(p => p.id === config.style);
     if (selectedStyle) {
       setConfig(prev => ({ ...prev, customRules: selectedStyle.defaultRules }));
     }
   }, [config.style]);
 
   const updateConfig = (updates: Partial<EditConfig>) => {
     setConfig(prev => ({ ...prev, ...updates }));
   };
 
   const buildFullPrompt = () => {
     const style = STYLE_PRESETS.find(s => s.id === config.style);
     const colorGrade = COLOR_GRADES.find(c => c.id === config.colorGrade);
     const effects = EFFECT_PRESETS.find(e => e.id === config.effectPreset);
     const graphics = config.graphics.map(g => GRAPHICS_TEMPLATES.find(t => t.id === g)).filter(Boolean);
     const versions = config.versions.map(v => VERSION_TYPES.find(t => t.id === v)).filter(Boolean);
 
     return `
 === AKEEF STUDIO AI - ADVANCED EDIT CONFIGURATION ===
 
 PRIMARY STYLE: ${style?.name || 'Custom'}
 ${config.customRules}
 
 === COLOR GRADING ===
 LUT: ${colorGrade?.name || 'None'}
 ${colorGrade ? `
 - Contrast: ${colorGrade.settings.contrast}
 - Saturation: ${colorGrade.settings.saturation}
 - Temperature: ${colorGrade.settings.temperature}K shift
 - Shadows: ${colorGrade.settings.shadows}
 - Highlights: ${colorGrade.settings.highlights}
 ` : ''}
 
 === EFFECTS & TRANSITIONS ===
 Mode: ${effects?.name || 'None'}
 Intensity: ${effects?.intensity || 'moderate'}
 ${effects ? `
 Transitions to use: ${effects.transitions.join(', ')}
 Motion effects: ${effects.motionEffects.join(', ')}
 ` : ''}
 
 === GRAPHICS & TITLES ===
 ${graphics.length > 0 ? graphics.map(g => `- ${g?.name}: ${g?.description}`).join('\n') : 'No graphics selected'}
 
 === VERSION OUTPUTS ===
 ${versions.map(v => `- ${v?.name} (${v?.duration}, ${v?.aspectRatio})`).join('\n')}
 
 Apply all these settings to create a professional edit. Output valid FCPXML only.
 `;
   };
 
   const handleGenerate = async () => {
     if (!file || !fileContent) return;
 
     try {
       setProcessingState('uploading');
       setProgress(10);
       setCurrentJob(null);
       setOutputXml(null);
       setStatusMessage('Analyzing source media...');
 
       const progressInterval = setInterval(() => {
         setProgress(p => Math.min(p + 3, 35));
       }, 200);
 
       setTimeout(() => {
         setStatusMessage('Applying style and color grading...');
       }, 1000);
 
       setProcessingState('processing');
       setProgress(40);
       clearInterval(progressInterval);
 
       const aiProgressInterval = setInterval(() => {
         setProgress(p => {
           if (p < 60) return p + 2;
           if (p < 80) return p + 1;
           return Math.min(p + 0.5, 92);
         });
       }, 400);
 
       setTimeout(() => setStatusMessage('Generating transitions and effects...'), 2000);
       setTimeout(() => setStatusMessage('Building timeline structure...'), 4000);
       setTimeout(() => setStatusMessage('Rendering version outputs...'), 6000);
 
       const { data: fnData, error: fnError } = await supabase.functions.invoke('process-fcpxml', {
         body: {
           fileContent,
           fileName: file.name,
           preset: config.style,
           model: config.model,
           styleRules: buildFullPrompt(),
           sessionId: getSessionId(),
           advancedConfig: {
             colorGrade: config.colorGrade,
             effectPreset: config.effectPreset,
             graphics: config.graphics,
             versions: config.versions,
             exportFormat: config.exportFormat,
           },
         },
       });
 
       clearInterval(aiProgressInterval);
 
       if (fnError) {
         throw new Error(fnError.message);
       }
 
       if (!fnData?.success) {
         throw new Error(fnData?.error || 'Processing failed');
       }
 
       setProgress(100);
       setProcessingState('completed');
       setStatusMessage('All versions rendered successfully!');
       setCurrentJob(fnData.job);
       setOutputXml(fnData.outputXml);
 
       toast({ 
         title: '✨ Export Complete', 
         description: `${config.versions.length} version(s) rendered with ${STYLE_PRESETS.find(s => s.id === config.style)?.name} style.`
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
    <div className="min-h-screen bg-background cyber-grid">
       <Header />
       
       <main className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
        {/* Top section - Source & Timeline Preview */}
        <div className="flex-shrink-0 border-b border-border/30 bg-card/30 backdrop-blur-sm">
           <div className="container mx-auto px-4 py-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               <SourcePanel 
                 file={file}
                 onFileChange={setFile}
                 fileContent={fileContent}
                 disabled={isProcessing}
               />
               <TimelinePanel 
                 fileContent={fileContent}
                 isProcessing={isProcessing}
               />
             </div>
           </div>
         </div>
 
        {/* Bottom section - Studio Tools & Output */}
         <div className="flex-1 overflow-hidden">
          <div className="container mx-auto px-4 py-5 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
               {/* Left - Tool Tabs */}
               <div className="lg:col-span-8 overflow-hidden">
                 <Tabs defaultValue="style" className="h-full flex flex-col">
                  <TabsList className="w-full justify-start bg-card/50 backdrop-blur-sm border border-border/40 p-1.5 h-auto flex-wrap gap-1.5 rounded-xl">
                    <TabsTrigger 
                      value="style" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Wand2 className="w-4 h-4" />
                       Style
                     </TabsTrigger>
                    <TabsTrigger 
                      value="color" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Palette className="w-4 h-4" />
                       Color
                     </TabsTrigger>
                    <TabsTrigger 
                      value="effects" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Zap className="w-4 h-4" />
                       Effects
                     </TabsTrigger>
                    <TabsTrigger 
                      value="graphics" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Type className="w-4 h-4" />
                       Graphics
                     </TabsTrigger>
                    <TabsTrigger 
                      value="versions" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Layers className="w-4 h-4" />
                       Versions
                     </TabsTrigger>
                    <TabsTrigger 
                      value="export" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                       Export
                     </TabsTrigger>
                   </TabsList>
 
                  <div className="flex-1 overflow-auto mt-5 pr-1">
                     <TabsContent value="style" className="m-0 h-full">
                       <StylePanel
                         style={config.style}
                         onStyleChange={(style) => updateConfig({ style })}
                         customRules={config.customRules}
                         onCustomRulesChange={(customRules) => updateConfig({ customRules })}
                         model={config.model}
                         onModelChange={(model) => updateConfig({ model })}
                         disabled={isProcessing}
                       />
                     </TabsContent>
 
                     <TabsContent value="color" className="m-0 h-full">
                       <ColorPanel
                         colorGrade={config.colorGrade}
                         onColorGradeChange={(colorGrade) => updateConfig({ colorGrade })}
                         disabled={isProcessing}
                       />
                     </TabsContent>
 
                     <TabsContent value="effects" className="m-0 h-full">
                       <EffectsPanel
                         effectPreset={config.effectPreset}
                         onEffectPresetChange={(effectPreset) => updateConfig({ effectPreset })}
                         disabled={isProcessing}
                       />
                     </TabsContent>
 
                     <TabsContent value="graphics" className="m-0 h-full">
                       <GraphicsPanel
                         selectedGraphics={config.graphics}
                         onGraphicsChange={(graphics) => updateConfig({ graphics })}
                         disabled={isProcessing}
                       />
                     </TabsContent>
 
                     <TabsContent value="versions" className="m-0 h-full">
                       <VersionPanel
                         selectedVersions={config.versions}
                         onVersionsChange={(versions) => updateConfig({ versions })}
                         disabled={isProcessing}
                       />
                     </TabsContent>
 
                     <TabsContent value="export" className="m-0 h-full">
                       <ExportPanel
                         exportFormat={config.exportFormat}
                         onExportFormatChange={(exportFormat) => updateConfig({ exportFormat })}
                         onGenerate={handleGenerate}
                         canGenerate={canGenerate}
                         isProcessing={isProcessing}
                         progress={progress}
                         statusMessage={statusMessage}
                         processingState={processingState}
                       />
                     </TabsContent>
                   </div>
                 </Tabs>
               </div>
 
               {/* Right - Output */}
               <div className="lg:col-span-4 overflow-auto">
                 <OutputPanel
                   job={currentJob}
                   outputXml={outputXml}
                   onNewEdit={handleReset}
                   config={config}
                   showOutput={showOutput}
                 />
               </div>
             </div>
           </div>
         </div>
       </main>
 
       {isProcessing && (
         <ProcessingOverlay 
           progress={progress} 
           message={statusMessage}
           config={config}
         />
       )}
     </div>
   );
 }
