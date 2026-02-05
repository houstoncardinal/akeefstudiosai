import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  STYLE_PRESETS,
  COLOR_GRADES,
  EFFECT_PRESETS,
  GRAPHICS_TEMPLATES,
  VERSION_TYPES,
  EXPORT_FORMATS,
  AI_MODELS,
  CINEMATIC_LUTS
} from '@/lib/presets';
import { type VideoFormat } from '@/lib/formats';
import { type AudioAnalysisResult } from '@/lib/audioAnalysis';
import { type VideoAnalysisResult } from '@/lib/videoAnalysis';
import Header from '@/components/studio/Header';
import SourcePanel from '@/components/studio/SourcePanel';
import TimelineVisualizerDetailed from '@/components/studio/TimelineVisualizerDetailed';
import VideoPreviewPanel from '@/components/studio/VideoPreviewPanel';
import StylePanel from '@/components/studio/StylePanel';
import ColorPanel, { type ColorSettings } from '@/components/studio/ColorPanel';
import EffectsPanel, { type EffectOverrides } from '@/components/studio/EffectsPanel';
import GraphicsPanel from '@/components/studio/GraphicsPanel';
import VersionPanel from '@/components/studio/VersionPanel';
import ExportPanel from '@/components/studio/ExportPanel';
import OutputPanel from '@/components/studio/OutputPanel';
import ProcessingOverlay from '@/components/studio/ProcessingOverlay';
import FormatToolsPanel from '@/components/studio/FormatToolsPanel';
import CustomRulesEditor from '@/components/studio/CustomRulesEditor';
import TransitionsPanel from '@/components/studio/TransitionsPanel';
import ShotIntelligencePanel from '@/components/studio/ShotIntelligencePanel';
import BeatEnginePanel from '@/components/studio/BeatEnginePanel';
import DirectorIntentPanel from '@/components/studio/DirectorIntentPanel';
import FeedbackPanel from '@/components/studio/FeedbackPanel';
import MultiVersionPanel from '@/components/studio/MultiVersionPanel';
import CustomRulesEditorEnhanced from '@/components/studio/CustomRulesEditorEnhanced';
import PanelWrapper from '@/components/studio/PanelWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
 import { 
   Palette, 
   Sparkles, 
   Type, 
   Layers, 
   Wand2,
   Zap,
   Wrench,
   ArrowRightLeft,
   Eye,
   Music,
  Compass,
  MessageSquare
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
  formatTools: string[];
   transitions: string[];
   shotAnalysisRules: Record<string, string[]>;
   beatRules: string[];
   directorIntent: string | null;
   customIntent: string;
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
    formatTools: ['scene_detection', 'auto_color'],
     transitions: [],
     shotAnalysisRules: {},
     beatRules: ['cut_on_beat', 'transition_on_downbeat'],
     directorIntent: null,
     customIntent: '',
   });
  
  // Detected format
  const [detectedFormat, setDetectedFormat] = useState<VideoFormat | null>(null);
  const [detectedBPM, setDetectedBPM] = useState<number | null>(null);

  // Analysis results
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [videoAnalysis, setVideoAnalysis] = useState<VideoAnalysisResult | null>(null);
  const [colorSettings, setColorSettings] = useState<ColorSettings | null>(null);
  const [effectOverrides, setEffectOverrides] = useState<EffectOverrides | null>(null);
 
   // Processing state
   const [processingState, setProcessingState] = useState<ProcessingState>('idle');
   const [progress, setProgress] = useState(0);
   const [statusMessage, setStatusMessage] = useState('');
   const [currentJob, setCurrentJob] = useState<JobData | null>(null);
   const [outputXml, setOutputXml] = useState<string | null>(null);
 
   // Parse file when uploaded
   useEffect(() => {
     if (file) {
      // For timeline files, read as text
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext === 'fcpxml' || ext === 'xml') {
        file.text().then(setFileContent);
      } else {
        // For video files, we don't need to read the content
        setFileContent(null);
      }
     } else {
       setFileContent(null);
      setDetectedFormat(null);
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
 

  const handleFormatDetected = (format: VideoFormat | null) => {
    setDetectedFormat(format);
  };

  const handleAudioAnalysisComplete = (result: AudioAnalysisResult) => {
    setAudioAnalysis(result);
    setDetectedBPM(result.bpm);
  };

  const handleVideoAnalysisComplete = (result: VideoAnalysisResult) => {
    setVideoAnalysis(result);
  };

  const handleColorSettingsChange = (settings: ColorSettings) => {
    setColorSettings(settings);
  };

  const handleEffectOverridesChange = (overrides: EffectOverrides) => {
    setEffectOverrides(overrides);
  };

  const buildFullPrompt = () => {
    const style = STYLE_PRESETS.find(s => s.id === config.style);
    const lut = CINEMATIC_LUTS.find(l => l.id === config.colorGrade);
    const effects = EFFECT_PRESETS.find(e => e.id === config.effectPreset);
    const graphics = config.graphics.map(g => GRAPHICS_TEMPLATES.find(t => t.id === g)).filter(Boolean);
    const versions = config.versions.map(v => VERSION_TYPES.find(t => t.id === v)).filter(Boolean);
    const transitions = config.transitions || [];
    const beatRules = config.beatRules || [];
    const shotRules = config.shotAnalysisRules || {};

    // Color values — custom overrides or LUT defaults
    const cs = colorSettings ?? (lut ? {
      contrast: lut.settings.contrast,
      saturation: lut.settings.saturation,
      temperature: lut.settings.temperature,
      shadows: lut.settings.shadows,
      highlights: lut.settings.highlights,
    } : null);

    // Enabled effects after overrides
    const enabledTransitions = effects
      ? effects.transitions.filter(t => !effectOverrides?.disabledTransitions.includes(t))
      : [];
    const enabledMotionEffects = effects
      ? effects.motionEffects.filter(e => !effectOverrides?.disabledMotionEffects.includes(e))
      : [];

    // Scene change timestamps from real analysis
    const sceneTimestamps = videoAnalysis?.sceneChanges.map(sc => sc.timestamp) || [];

    return `
=== AKEEF STUDIO AI - ADVANCED EDIT CONFIGURATION ===

SOURCE FORMAT: ${detectedFormat?.name || 'Auto-detect'}
CODEC: ${detectedFormat?.codec || 'Various'}
CATEGORY: ${detectedFormat?.category || 'Unknown'}

PRIMARY STYLE: ${style?.name || 'Custom'}
${config.customRules}

=== COLOR GRADING ===
LUT: ${lut?.name || 'None'}
${cs ? `Custom Color Settings:
- Contrast: ${cs.contrast}
- Saturation: ${cs.saturation}
- Temperature: ${cs.temperature}K shift
- Shadows: ${cs.shadows}
- Highlights: ${cs.highlights}` : ''}

=== EFFECTS & TRANSITIONS ===
Mode: ${effects?.name || 'None'}
Intensity: ${effects?.intensity || 'moderate'}
Enabled Transitions: ${enabledTransitions.length > 0 ? enabledTransitions.join(', ') : 'None'}
Enabled Motion Effects: ${enabledMotionEffects.length > 0 ? enabledMotionEffects.join(', ') : 'None'}
${effectOverrides && (effectOverrides.disabledTransitions.length > 0 || effectOverrides.disabledMotionEffects.length > 0)
  ? `Disabled by user: ${[...effectOverrides.disabledTransitions, ...effectOverrides.disabledMotionEffects].join(', ')}` : ''}

=== SELECTED TRANSITIONS ===
${transitions.length > 0 ? transitions.map(t => `- ${t.replace(/_/g, ' ')}`).join('\n') : 'Default transitions'}

=== AI PROCESSING TOOLS ===
${config.formatTools.length > 0 ? config.formatTools.join(', ') : 'Standard processing'}

=== BEAT SYNC RULES ===
${beatRules.length > 0 ? beatRules.map(r => `- ${r.replace(/_/g, ' ')}`).join('\n') : 'No beat sync'}
Detected BPM: ${detectedBPM || 'Unknown'}
${audioAnalysis ? `Beat Timestamps (${audioAnalysis.beatTimestamps.length} beats): ${audioAnalysis.beatTimestamps.slice(0, 30).map(t => t.toFixed(2) + 's').join(', ')}${audioAnalysis.beatTimestamps.length > 30 ? '...' : ''}
Audio Duration: ${audioAnalysis.duration.toFixed(1)}s
Energy Curve (${audioAnalysis.energyCurve.length} segments): ${audioAnalysis.energyCurve.map(v => v.toFixed(2)).join(', ')}` : ''}

=== VIDEO ANALYSIS ===
${videoAnalysis ? `Frames Analyzed: ${videoAnalysis.frameCount}
Duration: ${videoAnalysis.duration.toFixed(1)}s
Average Brightness: ${Math.round(videoAnalysis.averageBrightness * 100)}%
Scene Changes (${videoAnalysis.sceneChanges.length}): ${sceneTimestamps.map(t => t.toFixed(1) + 's').join(', ')}` : 'No video analysis performed'}

=== SHOT INTELLIGENCE RULES ===
${Object.keys(shotRules).length > 0 ? Object.entries(shotRules).map(([key, values]) => `- ${key}: ${(values as string[]).join(', ')}`).join('\n') : 'No shot filters'}

=== DIRECTOR INTENT ===
${config.directorIntent ? `Mode: ${config.directorIntent}` : 'None'}
${config.customIntent ? `Custom Vision: ${config.customIntent}` : ''}

=== GRAPHICS & TITLES ===
${graphics.length > 0 ? graphics.map(g => `- ${g?.name}: ${g?.description}`).join('\n') : 'No graphics selected'}

=== VERSION OUTPUTS ===
${versions.map(v => `- ${v?.name} (${v?.duration}, ${v?.aspectRatio})`).join('\n')}

Apply all these settings to create a professional edit. Output valid FCPXML only.
`;
  };
 
   // Track active timers for cleanup
   const timersRef = useRef<number[]>([]);

   const clearAllTimers = useCallback(() => {
     timersRef.current.forEach(id => clearInterval(id));
     timersRef.current = [];
   }, []);

   // Cleanup timers on unmount
   useEffect(() => {
     return () => clearAllTimers();
   }, [clearAllTimers]);

   const handleGenerate = async () => {
    if (!file) return;

    const isTimelineFile = detectedFormat?.category === 'timeline';

    if (isTimelineFile && !fileContent) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not read timeline file content',
      });
      return;
    }

     try {
       clearAllTimers();
       setProcessingState('uploading');
       setProgress(10);
       setCurrentJob(null);
       setOutputXml(null);
       setStatusMessage('Analyzing source media...');

       const progressInterval = window.setInterval(() => {
         setProgress(p => Math.min(p + 3, 35));
       }, 200);
       timersRef.current.push(progressInterval);

       const statusTimer1 = window.setTimeout(() => {
         setStatusMessage('Applying style and color grading...');
       }, 1000);
       timersRef.current.push(statusTimer1);

       setProcessingState('processing');
       setProgress(40);
       clearInterval(progressInterval);

       const aiProgressInterval = window.setInterval(() => {
         setProgress(p => {
           if (p < 60) return p + 2;
           if (p < 80) return p + 1;
           return Math.min(p + 0.5, 92);
         });
       }, 400);
       timersRef.current.push(aiProgressInterval);

       const t2 = window.setTimeout(() => setStatusMessage('Generating transitions and effects...'), 2000);
       const t3 = window.setTimeout(() => setStatusMessage('Building timeline structure...'), 4000);
       const t4 = window.setTimeout(() => setStatusMessage('Rendering version outputs...'), 6000);
       timersRef.current.push(t2, t3, t4);

        // Client-side timeout to prevent infinite hang if edge function is killed
       const CLIENT_TIMEOUT_MS = 90_000; // 90 seconds
       const invokePromise = supabase.functions.invoke('process-video', {
         body: {
            fileContent: isTimelineFile ? fileContent : null,
           fileName: file.name,
           preset: config.style,
           model: config.model,
           styleRules: buildFullPrompt(),
           sessionId: getSessionId(),
            fileType: detectedFormat?.id || 'unknown',
            isVideoFile: !isTimelineFile,
           advancedConfig: {
             colorGrade: config.colorGrade,
             effectPreset: config.effectPreset,
             graphics: config.graphics,
             versions: config.versions,
             exportFormat: config.exportFormat,
              formatTools: config.formatTools,
           },
           analysisMetadata: {
             audio: audioAnalysis ? {
               bpm: audioAnalysis.bpm,
               duration: audioAnalysis.duration,
               beatCount: audioAnalysis.beatTimestamps.length,
             } : null,
             video: videoAnalysis ? {
               sceneCount: videoAnalysis.sceneChanges.length,
               duration: videoAnalysis.duration,
               averageBrightness: videoAnalysis.averageBrightness,
               frameCount: videoAnalysis.frameCount,
             } : null,
             color: colorSettings,
             effects: effectOverrides,
             detectedFormat: detectedFormat?.id ?? null,
           },
         },
       });

       const timeoutPromise = new Promise<never>((_, reject) => {
         const id = window.setTimeout(() => {
           reject(new Error('Processing timed out. The AI took too long to respond. Please try a faster model or simpler input.'));
         }, CLIENT_TIMEOUT_MS);
         timersRef.current.push(id);
       });

       const { data: fnData, error: fnError } = await Promise.race([invokePromise, timeoutPromise]);

       clearAllTimers();

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
         title: 'Export Complete',
         description: `${config.versions.length} version(s) rendered with ${STYLE_PRESETS.find(s => s.id === config.style)?.name} style.`
       });

     } catch (err) {
       clearAllTimers();
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
   const canGenerate = !!file && !isProcessing;
   const showOutput = !!(processingState === 'completed' && currentJob && outputXml);

  return (
   <div className="min-h-screen bg-background">
       <Header />
       
      <main className="h-[calc(100vh-56px)] overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Top section - Source & Timeline Preview */}
          <ResizablePanel defaultSize={35} minSize={15} maxSize={70} className="overflow-hidden">
            <div className="h-full bg-card/30 backdrop-blur-sm overflow-auto">
              <div className="px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <SourcePanel
                    file={file}
                    onFileChange={setFile}
                    fileContent={fileContent}
                    disabled={isProcessing}
                    onFormatDetected={handleFormatDetected}
                  />
                  <VideoPreviewPanel
                    file={file}
                    detectedFormat={detectedFormat}
                    colorGrade={config.colorGrade}
                    effectPreset={config.effectPreset}
                    isProcessing={isProcessing}
                    colorSettings={colorSettings}
                    beatTimestamps={audioAnalysis?.beatTimestamps}
                    sceneChangeTimestamps={videoAnalysis?.sceneChanges.map(sc => sc.timestamp)}
                  />
                  <TimelineVisualizerDetailed
                    fileContent={fileContent}
                    isProcessing={isProcessing}
                    detectedFormat={detectedFormat}
                    detectedBPM={detectedBPM}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="hover:bg-primary/10 transition-colors" />

          {/* Bottom section - Studio Tools & Output */}
          <ResizablePanel defaultSize={65} minSize={30} className="overflow-hidden">
            <div className="px-4 py-5 h-full">
              <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg">
               {/* Left - Tool Tabs */}
               <ResizablePanel defaultSize={65} minSize={40} maxSize={85} className="overflow-hidden">
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
                      value="tools" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Wrench className="w-4 h-4" />
                       AI Tools
                     </TabsTrigger>
                    <TabsTrigger 
                      value="transitions" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                       Transitions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="shots" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                       Shots
                    </TabsTrigger>
                    <TabsTrigger 
                      value="beats" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Music className="w-4 h-4" />
                       Beats
                    </TabsTrigger>
                    <TabsTrigger 
                      value="intent" 
                      className="gap-2 text-xs px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all"
                    >
                      <Compass className="w-4 h-4" />
                       Intent
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
                       <PanelWrapper title="Style" icon={<Wand2 className="w-4 h-4" />}>
                         <StylePanel
                           style={config.style}
                           onStyleChange={(style) => updateConfig({ style })}
                           model={config.model}
                           onModelChange={(model) => updateConfig({ model })}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
 
                     <TabsContent value="color" className="m-0 h-full">
                       <PanelWrapper title="Color" icon={<Palette className="w-4 h-4" />}>
                         <ColorPanel
                           colorGrade={config.colorGrade}
                           onColorGradeChange={(colorGrade) => { updateConfig({ colorGrade }); setColorSettings(null); }}
                           onColorSettingsChange={handleColorSettingsChange}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
 
                     <TabsContent value="effects" className="m-0 h-full">
                       <PanelWrapper title="Effects" icon={<Zap className="w-4 h-4" />}>
                         <EffectsPanel
                           effectPreset={config.effectPreset}
                           onEffectPresetChange={(effectPreset) => { updateConfig({ effectPreset }); setEffectOverrides(null); }}
                           onEffectOverridesChange={handleEffectOverridesChange}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
 
                     <TabsContent value="graphics" className="m-0 h-full">
                       <PanelWrapper title="Graphics" icon={<Type className="w-4 h-4" />}>
                         <GraphicsPanel
                           selectedGraphics={config.graphics}
                           onGraphicsChange={(graphics) => updateConfig({ graphics })}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
 
                     <TabsContent value="versions" className="m-0 h-full">
                       <PanelWrapper title="Versions" icon={<Layers className="w-4 h-4" />}>
                         <MultiVersionPanel
                           selectedVersions={config.versions}
                           onVersionsChange={(versions) => updateConfig({ versions })}
                           isProcessing={isProcessing}
                           generatedVersions={showOutput ? ['full_edit'] : []}
                         />
                       </PanelWrapper>
                     </TabsContent>
                     
                     <TabsContent value="tools" className="m-0 h-full">
                       <PanelWrapper title="AI Tools" icon={<Wrench className="w-4 h-4" />}>
                         <FormatToolsPanel
                           format={detectedFormat}
                           selectedTools={config.formatTools}
                           onToolsChange={(formatTools) => updateConfig({ formatTools })}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
                     
                     <TabsContent value="transitions" className="m-0 h-full">
                       <PanelWrapper title="Transitions" icon={<ArrowRightLeft className="w-4 h-4" />}>
                         <TransitionsPanel
                           selectedTransitions={config.transitions}
                           onTransitionsChange={(transitions) => updateConfig({ transitions })}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
                     
                     <TabsContent value="shots" className="m-0 h-full">
                       <PanelWrapper title="Shots" icon={<Eye className="w-4 h-4" />}>
                         <ShotIntelligencePanel
                           analysisRules={config.shotAnalysisRules}
                           onRulesChange={(shotAnalysisRules) => updateConfig({ shotAnalysisRules })}
                           disabled={isProcessing}
                           file={file}
                           onAnalysisComplete={handleVideoAnalysisComplete}
                         />
                       </PanelWrapper>
                     </TabsContent>
                     
                     <TabsContent value="beats" className="m-0 h-full">
                       <PanelWrapper title="Beats" icon={<Music className="w-4 h-4" />}>
                         <BeatEnginePanel
                           file={file}
                           beatRules={config.beatRules}
                           onBeatRulesChange={(beatRules) => updateConfig({ beatRules })}
                           onAnalysisComplete={handleAudioAnalysisComplete}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
                     
                     <TabsContent value="intent" className="m-0 h-full">
                       <PanelWrapper title="Intent" icon={<Compass className="w-4 h-4" />}>
                         <DirectorIntentPanel
                           selectedIntent={config.directorIntent}
                           customIntent={config.customIntent}
                           onIntentChange={(directorIntent) => updateConfig({ directorIntent })}
                           onCustomIntentChange={(customIntent) => updateConfig({ customIntent })}
                           disabled={isProcessing}
                         />
                       </PanelWrapper>
                     </TabsContent>
 
                     <TabsContent value="export" className="m-0 h-full">
                       <PanelWrapper title="Export" icon={<Sparkles className="w-4 h-4" />}>
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
                       </PanelWrapper>
                     </TabsContent>
                   </div>
                 </Tabs>
               </ResizablePanel>

               <ResizableHandle withHandle className="hover:bg-primary/10 transition-colors" />

               {/* Right - Output */}
               <ResizablePanel defaultSize={35} minSize={15} maxSize={50} className="overflow-auto pl-4">
                {/* AI Feedback Panel - Shows after processing */}
                {showOutput && (
                  <div className="mb-4">
                    <FeedbackPanel
                      config={config}
                      timelineData={{
                        duration: 180,
                        bpm: detectedBPM || 128,
                        sections: ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'],
                      }}
                      showAfterProcessing={showOutput}
                    />
                  </div>
                )}
                
                 {/* Prominent Custom Rules Editor */}
                 <div className="mb-4">
                    <CustomRulesEditorEnhanced
                     value={config.customRules}
                     onChange={(customRules) => updateConfig({ customRules })}
                     disabled={isProcessing}
                   />
                 </div>
                 
                 <OutputPanel
                   job={currentJob}
                   outputXml={outputXml}
                   onNewEdit={handleReset}
                   config={config}
                   showOutput={showOutput}
                 />
               </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
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
