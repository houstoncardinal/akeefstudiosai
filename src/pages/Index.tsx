import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  STYLE_PRESETS,
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
import { cn } from '@/lib/utils';
import SourcePanel from '@/components/studio/SourcePanel';
import ExportsLibrary from '@/components/studio/ExportsLibrary';
import TimelineVisualizerDetailed from '@/components/studio/TimelineVisualizerDetailed';
import EditingCanvas from '@/components/studio/EditingCanvas';
import VideoPreviewPanel from '@/components/studio/VideoPreviewPanel';
import StylePanel from '@/components/studio/StylePanel';
import ColorPanel, { getLUTDefaults } from '@/components/studio/ColorPanel';
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
import KeyboardShortcutsOverlay from '@/components/studio/KeyboardShortcutsOverlay';
import DraftRecoveryBanner from '@/components/studio/DraftRecoveryBanner';
import ToolRail from '@/components/studio/ToolRail';
import WelcomeGuide from '@/components/studio/WelcomeGuide';
import QuickExportBar from '@/components/studio/QuickExportBar';
import VisualWorkflowIndicator from '@/components/studio/VisualWorkflowIndicator';
import AIInsightsPanel from '@/components/studio/AIInsightsPanel';
import AIVibeStudio from '@/components/studio/AIVibeStudio';
import ClipLibrary, { type MediaClip } from '@/components/studio/ClipLibrary';
import PostProductionPanel, { type PostProductionSettings, DEFAULT_POST_PRODUCTION } from '@/components/studio/PostProductionPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import AdvancedSettingsPanel from '@/components/studio/AdvancedSettingsPanel';
import TransitionsLibraryPanel from '@/components/studio/TransitionsLibraryPanel';
import MotionEffectsPanel from '@/components/studio/MotionEffectsPanel';
import { FrameCaptureProvider, useFrameCapture } from '@/components/studio/LUTPreviewSystem';
import { type StackedLUT, blendLUTSettings } from '@/components/studio/LUTStackPanel';
import { type AdvancedSettings, DEFAULT_ADVANCED_SETTINGS } from '@/lib/advancedPresets';
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
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Video,
  FileCode,
  FolderOpen,
  Keyboard,
  SlidersHorizontal,
  Clapperboard,
  Library,
  Film,
} from 'lucide-react';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useLiveLUTThumbnails } from '@/hooks/useLiveLUTThumbnails';
import { useKeyboardShortcuts, type ShortcutAction } from '@/hooks/useKeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DEFAULT_COLOR_SETTINGS, type FullColorSettings } from '@/hooks/useWebGLRenderer';
import { useDeviceType } from '@/hooks/use-mobile';
import { useExportHistory } from '@/hooks/useExportHistory';
import { useUserPreferences } from '@/hooks/useUserPreferences';

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

const toolSections = [
  { id: 'ai-vibe', label: 'AI Vibe', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'clips', label: 'Clips', icon: <Library className="w-4 h-4" /> },
  { id: 'style', label: 'Style', icon: <Wand2 className="w-4 h-4" /> },
  { id: 'color', label: 'Color', icon: <Palette className="w-4 h-4" /> },
  { id: 'effects', label: 'Effects', icon: <Zap className="w-4 h-4" /> },
  { id: 'motion', label: 'Motion', icon: <Clapperboard className="w-4 h-4" /> },
  { id: 'graphics', label: 'Graphics', icon: <Type className="w-4 h-4" /> },
  { id: 'versions', label: 'Versions', icon: <Layers className="w-4 h-4" /> },
  { id: 'tools', label: 'AI Tools', icon: <Wrench className="w-4 h-4" /> },
  { id: 'transitions', label: 'Transitions', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 'transitions_lib', label: 'Trans Library', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 'shots', label: 'Shots', icon: <Eye className="w-4 h-4" /> },
  { id: 'beats', label: 'Beats', icon: <Music className="w-4 h-4" /> },
  { id: 'intent', label: 'Intent', icon: <Compass className="w-4 h-4" /> },
  { id: 'postprod', label: 'Post-Prod', icon: <Film className="w-4 h-4" /> },
  { id: 'advanced', label: 'Pro Settings', icon: <SlidersHorizontal className="w-4 h-4" /> },
  { id: 'export', label: 'Export', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'exports', label: 'Exports', icon: <FolderOpen className="w-4 h-4" /> },
];

const toolIcons: Record<string, React.ReactNode> = {
  'ai-vibe': <Sparkles className="w-3.5 h-3.5" />,
  clips: <Library className="w-3.5 h-3.5" />,
  style: <Wand2 className="w-3.5 h-3.5" />,
  color: <Palette className="w-3.5 h-3.5" />,
  effects: <Zap className="w-3.5 h-3.5" />,
  motion: <Clapperboard className="w-3.5 h-3.5" />,
  graphics: <Type className="w-3.5 h-3.5" />,
  versions: <Layers className="w-3.5 h-3.5" />,
  tools: <Wrench className="w-3.5 h-3.5" />,
  transitions: <ArrowRightLeft className="w-3.5 h-3.5" />,
  transitions_lib: <ArrowRightLeft className="w-3.5 h-3.5" />,
  shots: <Eye className="w-3.5 h-3.5" />,
  beats: <Music className="w-3.5 h-3.5" />,
  intent: <Compass className="w-3.5 h-3.5" />,
  postprod: <Film className="w-3.5 h-3.5" />,
  advanced: <SlidersHorizontal className="w-3.5 h-3.5" />,
  export: <Sparkles className="w-3.5 h-3.5" />,
  exports: <FolderOpen className="w-3.5 h-3.5" />,
};

export default function Index() {
  const { toast } = useToast();
  const device = useDeviceType();
  const { records: exportRecords, addExport, removeExport, clearAll: clearExports, redownload: redownloadExport } = useExportHistory();
  
  // User preferences and onboarding
  const { 
    preferences, 
    isNewUser, 
    trackFeatureUse, 
    markTooltipSeen,
    updatePreferredSetting,
    recordExport,
    completeOnboarding 
  } = useUserPreferences();
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome guide for new users
  useEffect(() => {
    if (isNewUser && !preferences.hasCompletedOnboarding) {
      setShowWelcome(true);
    }
  }, [isNewUser, preferences.hasCompletedOnboarding]);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  // Edit configuration
  const [config, setConfig] = useState<EditConfig>({
    style: STYLE_PRESETS[0].id,
    colorGrade: CINEMATIC_LUTS[0].id,
    effectPreset: EFFECT_PRESETS[1].id,
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
  const {
    present: colorSettings,
    set: setColorSettings,
    undo: undoColor,
    redo: redoColor,
    reset: resetColorSettings,
    canUndo: canUndoColor,
    canRedo: canRedoColor,
  } = useUndoRedo<FullColorSettings | null>(DEFAULT_COLOR_SETTINGS);
  const [effectOverrides, setEffectOverrides] = useState<EffectOverrides | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>(DEFAULT_ADVANCED_SETTINGS);
  const [selectedMotionEffects, setSelectedMotionEffects] = useState<string[]>([]);
  const [selectedTransitionsLib, setSelectedTransitionsLib] = useState<string[]>([]);
  const [lutStack, setLutStack] = useState<StackedLUT[]>([]);
  
  // Multi-clip library state
  const [clipLibrary, setClipLibrary] = useState<MediaClip[]>([]);
  const [timelineClipIds, setTimelineClipIds] = useState<string[]>([]);
  
  // Post-production settings
  const [postProdSettings, setPostProdSettings] = useState<PostProductionSettings>(DEFAULT_POST_PRODUCTION);
  
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lutThumbnails = useLiveLUTThumbnails(previewVideoRef, CINEMATIC_LUTS, { enabled: !!file });
  
  // Frame capture for LUT preview system
  const { currentFrame, startCapturing, stopCapturing } = useFrameCapture(previewVideoRef);
  
  // Start/stop frame capture based on file presence
  useEffect(() => {
    if (file && previewVideoRef.current) {
      startCapturing();
    } else {
      stopCapturing();
    }
    return () => stopCapturing();
  }, [file, startCapturing, stopCapturing]);

  // Processing state
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentJob, setCurrentJob] = useState<JobData | null>(null);
  const [outputXml, setOutputXml] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ai-vibe');

  // Track tab changes for user preferences
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    trackFeatureUse(`panel-${tab}`);
  }, [trackFeatureUse]);

  // Mobile-specific: collapsible media section
  const [mediaCollapsed, setMediaCollapsed] = useState(false);
  
  // Playback state for shortcuts
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  // Sync video playback when timeline playhead changes from EditingCanvas
  const handlePlayheadFromCanvas = useCallback((time: number) => {
    setPlayheadPosition(time);
    const video = previewVideoRef.current;
    if (video && Math.abs(video.currentTime - time) > 0.5) {
      video.currentTime = time;
    }
  }, []);

  // Sync timeline playhead when video plays
  const handleVideoTimeUpdate = useCallback((time: number) => {
    setPlayheadPosition(time);
  }, []);

  // Auto-save functionality
  const { 
    showRecoveryBanner, 
    draftInfo, 
    restoreDraft, 
    discardDraft, 
    dismissBanner,
    saveDraft 
  } = useAutoSave({
    enabled: true,
    data: config,
    fileName: file?.name,
    onRestore: (restoredConfig) => setConfig(restoredConfig),
  });

  // Keyboard shortcuts
  const shortcuts: ShortcutAction[] = useMemo(() => [
    // Playback
    { key: ' ', action: () => setIsPlaying(p => !p), description: 'Play / Pause', category: 'playback' },
    { key: 'j', action: () => setPlayheadPosition(p => Math.max(0, p - 1)), description: 'Rewind', category: 'playback' },
    { key: 'k', action: () => setIsPlaying(false), description: 'Stop', category: 'playback' },
    { key: 'l', action: () => setPlayheadPosition(p => p + 1), description: 'Forward', category: 'playback' },
    { key: 'Home', action: () => setPlayheadPosition(0), description: 'Go to start', category: 'playback' },
    // Editing
    { key: 's', action: () => { /* split clip */ }, description: 'Split clip at playhead', category: 'edit' },
    { key: 'v', action: () => { /* select tool */ }, description: 'Selection tool', category: 'edit' },
    { key: 'z', ctrl: true, action: () => undoColor(), description: 'Undo', category: 'edit' },
    { key: 'z', ctrl: true, shift: true, action: () => redoColor(), description: 'Redo', category: 'edit' },
    { key: 's', ctrl: true, action: () => saveDraft(), description: 'Save draft', category: 'edit' },
    // View/Navigation
    { key: '1', action: () => handleTabChange('style'), description: 'Style panel', category: 'navigation' },
    { key: '2', action: () => handleTabChange('color'), description: 'Color panel', category: 'navigation' },
    { key: '3', action: () => handleTabChange('effects'), description: 'Effects panel', category: 'navigation' },
    { key: '4', action: () => handleTabChange('export'), description: 'Export panel', category: 'navigation' },
  ], [undoColor, redoColor, saveDraft, handleTabChange]);

  // Keyboard shortcuts hook - see actual hook call below after isProcessing is defined

  // Parse file when uploaded
  useEffect(() => {
    if (file) {
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext === 'fcpxml' || ext === 'xml') {
        file.text().then(setFileContent);
      } else {
        setFileContent(null);
      }
    } else {
      setFileContent(null);
      setDetectedFormat(null);
    }
  }, [file]);

  // Auto-analyze video and audio when a video file is uploaded
  useEffect(() => {
    if (!file || !file.type.startsWith('video/')) return;

    let cancelled = false;

    // Auto-run video scene detection
    (async () => {
      try {
        const { analyzeVideo } = await import('@/lib/videoAnalysis');
        const result = await analyzeVideo(file, 0.5, 0.15);
        if (!cancelled) {
          setVideoAnalysis(result);
        }
      } catch (err) {
        console.warn('Auto video analysis failed:', err);
      }
    })();

    // Auto-run audio beat detection
    (async () => {
      try {
        const { analyzeAudio } = await import('@/lib/audioAnalysis');
        const result = await analyzeAudio(file, 50);
        if (!cancelled) {
          setAudioAnalysis(result);
          setDetectedBPM(result.bpm);
        }
      } catch (err) {
        console.warn('Auto audio analysis failed:', err);
      }
    })();

    return () => { cancelled = true; };
  }, [file]);

  // Update custom rules when style changes
  useEffect(() => {
    const selectedStyle = STYLE_PRESETS.find(p => p.id === config.style);
    if (selectedStyle) {
      setConfig(prev => ({ ...prev, customRules: selectedStyle.defaultRules }));
    }
  }, [config.style]);

  // Reset color settings whenever the LUT changes
  useEffect(() => {
    const lut = CINEMATIC_LUTS.find(l => l.id === config.colorGrade);
    if (lut) {
      resetColorSettings(getLUTDefaults(lut));
    } else {
      resetColorSettings(DEFAULT_COLOR_SETTINGS);
    }
  }, [config.colorGrade, resetColorSettings]);

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

  const handleColorSettingsChange = (settings: FullColorSettings) => {
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

    const cs: FullColorSettings | null = colorSettings ?? (lut ? getLUTDefaults(lut) : null);

    const enabledTransitions = effects
      ? effects.transitions.filter(t => !effectOverrides?.disabledTransitions.includes(t))
      : [];
    const enabledMotionEffects = effects
      ? effects.motionEffects.filter(e => !effectOverrides?.disabledMotionEffects.includes(e))
      : [];

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
- Temperature: ${cs.temperature} shift
- Tint: ${cs.tint}
- Shadows: ${cs.shadows}
- Highlights: ${cs.highlights}
- Lift: R ${cs.lift.r.toFixed(2)}, G ${cs.lift.g.toFixed(2)}, B ${cs.lift.b.toFixed(2)}
- Gamma: R ${cs.gamma.r.toFixed(2)}, G ${cs.gamma.g.toFixed(2)}, B ${cs.gamma.b.toFixed(2)}
- Gain: R ${cs.gain.r.toFixed(2)}, G ${cs.gain.g.toFixed(2)}, B ${cs.gain.b.toFixed(2)}` : ''}

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

      const CLIENT_TIMEOUT_MS = 90_000;
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

  // Keyboard shortcuts hook - defined after isProcessing
  const { showOverlay: showShortcutsOverlay, setShowOverlay: setShowShortcutsOverlay } = useKeyboardShortcuts({
    enabled: !isProcessing,
    shortcuts,
  });

  // ── Shared panel content (used across all layouts) ──
  const renderToolContent = () => (
    <>
      <TabsContent value="ai-vibe" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="AI Vibe Studio" icon={<Sparkles className="w-4 h-4" />}>
          <AIVibeStudio
            currentConfig={config}
            onApplyConfig={(newConfig) => updateConfig(newConfig)}
            file={file}
            detectedBPM={detectedBPM}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="clips" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Clip Library" icon={<Library className="w-4 h-4" />}>
          <ClipLibrary
            clips={clipLibrary}
            onClipsChange={setClipLibrary}
            onClipSelect={(clipId) => {
              const clip = clipLibrary.find(c => c.id === clipId);
              if (clip) {
                setFile(clip.file);
                trackFeatureUse('clip-select');
              }
            }}
            onAddToTimeline={(clipIds) => {
              setTimelineClipIds(prev => [...prev, ...clipIds]);
              trackFeatureUse('add-to-timeline');
            }}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="style" className="m-0 h-full data-[state=active]:animate-fade-in">
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

      <TabsContent value="color" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Color" icon={<Palette className="w-4 h-4" />}>
          <ColorPanel
            colorGrade={config.colorGrade}
            onColorGradeChange={(colorGrade) => {
              updateConfig({ colorGrade });
              const lut = CINEMATIC_LUTS.find(l => l.id === colorGrade);
              resetColorSettings(lut ? getLUTDefaults(lut) : DEFAULT_COLOR_SETTINGS);
            }}
            settings={colorSettings}
            onColorSettingsChange={handleColorSettingsChange}
            lutThumbnails={lutThumbnails}
            canUndo={canUndoColor}
            canRedo={canRedoColor}
            onUndo={undoColor}
            onRedo={redoColor}
            disabled={isProcessing}
            currentFrame={currentFrame}
            lutStack={lutStack}
            onLutStackChange={setLutStack}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="effects" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Effects" icon={<Zap className="w-4 h-4" />}>
          <EffectsPanel
            effectPreset={config.effectPreset}
            onEffectPresetChange={(effectPreset) => { updateConfig({ effectPreset }); setEffectOverrides(null); }}
            onEffectOverridesChange={handleEffectOverridesChange}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="motion" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Motion Effects" icon={<Clapperboard className="w-4 h-4" />}>
          <MotionEffectsPanel
            selectedEffects={selectedMotionEffects}
            onEffectsChange={setSelectedMotionEffects}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="graphics" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Graphics" icon={<Type className="w-4 h-4" />}>
          <GraphicsPanel
            selectedGraphics={config.graphics}
            onGraphicsChange={(graphics) => updateConfig({ graphics })}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="versions" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Versions" icon={<Layers className="w-4 h-4" />}>
          <MultiVersionPanel
            selectedVersions={config.versions}
            onVersionsChange={(versions) => updateConfig({ versions })}
            isProcessing={isProcessing}
            generatedVersions={showOutput ? ['full_edit'] : []}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="tools" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="AI Tools" icon={<Wrench className="w-4 h-4" />}>
          <FormatToolsPanel
            format={detectedFormat}
            selectedTools={config.formatTools}
            onToolsChange={(formatTools) => updateConfig({ formatTools })}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="transitions" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Transitions" icon={<ArrowRightLeft className="w-4 h-4" />}>
          <TransitionsPanel
            selectedTransitions={config.transitions}
            onTransitionsChange={(transitions) => updateConfig({ transitions })}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="transitions_lib" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Transitions Library" icon={<ArrowRightLeft className="w-4 h-4" />}>
          <TransitionsLibraryPanel
            selectedTransitions={selectedTransitionsLib}
            onTransitionsChange={setSelectedTransitionsLib}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="shots" className="m-0 h-full data-[state=active]:animate-fade-in">
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

      <TabsContent value="beats" className="m-0 h-full data-[state=active]:animate-fade-in">
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

      <TabsContent value="intent" className="m-0 h-full data-[state=active]:animate-fade-in">
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

      <TabsContent value="postprod" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Post-Production" icon={<Film className="w-4 h-4" />}>
          <PostProductionPanel
            settings={postProdSettings}
            onSettingsChange={setPostProdSettings}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="advanced" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="Pro Settings" icon={<SlidersHorizontal className="w-4 h-4" />}>
          <AdvancedSettingsPanel
            settings={advancedSettings}
            onSettingsChange={setAdvancedSettings}
            disabled={isProcessing}
          />
        </PanelWrapper>
      </TabsContent>

      <TabsContent value="export" className="m-0 h-full data-[state=active]:animate-fade-in">
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

      <TabsContent value="exports" className="m-0 h-full data-[state=active]:animate-fade-in">
        <PanelWrapper title="My Exports" icon={<FolderOpen className="w-4 h-4" />}>
          <ExportsLibrary
            records={exportRecords}
            onRedownload={redownloadExport}
            onRemove={removeExport}
            onClearAll={clearExports}
          />
        </PanelWrapper>
      </TabsContent>
    </>
  );

  // Quick export handler - for project files only (XML formats)
  // Video exports require the Export Dialog for proper rendering
  const handleQuickExport = useCallback((filename: string) => {
    if (!outputXml) return;
    
    const fmt = EXPORT_FORMATS.find(f => f.id === config.exportFormat);
    const isProjectFile = fmt?.codec === 'N/A';
    
    // For video formats, we export the project file (FCPXML) instead
    // since browser-based video rendering requires the Export Dialog
    const ext = isProjectFile ? (fmt?.extension || '.fcpxml') : '.fcpxml';
    const actualFilename = filename.replace(/\.[^.]+$/, '') + ext;
    const mime = 'application/xml';
    
    const blob = new Blob([outputXml], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = actualFilename;
    a.click();
    URL.revokeObjectURL(url);
    
    addExport({
      filename: actualFilename,
      formatId: isProjectFile ? config.exportFormat : 'fcpxml',
      formatName: isProjectFile ? (fmt?.name || 'FCPXML') : 'FCPXML Project',
      extension: ext,
      style: config.style,
      model: config.model,
      colorGrade: config.colorGrade,
      sizeBytes: blob.size,
      content: btoa(outputXml),
    });
    recordExport();
    trackFeatureUse('quick-export');
    
    const description = isProjectFile 
      ? actualFilename 
      : `${actualFilename} (project file - open in video editor for full video export)`;
    toast({ title: 'Export started!', description });
  }, [outputXml, config, addExport, recordExport, trackFeatureUse, toast]);

  // Workflow indicator props
  const workflowIndicatorProps = {
    hasFile: !!file,
    hasStyle: config.style !== 'none',
    hasEffects: config.effectPreset !== 'none' || config.transitions.length > 0,
    isProcessing,
    hasOutput: showOutput,
  };

  const renderSidePanel = () => (
    <div className="flex flex-col h-full">
      {/* Output Panel at top */}
      <OutputPanel
        job={currentJob}
        outputXml={outputXml}
        onNewEdit={handleReset}
        config={config}
        showOutput={showOutput}
        file={file}
        videoRef={previewVideoRef}
        effectsCanvas={previewCanvasRef.current}
        onExportSaved={(record) => {
          addExport(record);
          recordExport();
          trackFeatureUse('export-completed');
        }}
      />
      
      {showOutput && (
        <div className="my-4">
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
      
      {/* Spacer to push bottom items down */}
      <div className="flex-1" />
      
      {/* AI Edit Instructions - positioned at bottom right above workflow/insights */}
      <div className="mb-4">
        <CustomRulesEditorEnhanced
          value={config.customRules}
          onChange={(customRules) => updateConfig({ customRules })}
          disabled={isProcessing}
        />
      </div>
      
      {/* AI Insights - bottom */}
      <div className="mb-4">
        <AIInsightsPanel
          file={file}
          colorGrade={config.colorGrade}
          effectPreset={config.effectPreset}
          transitions={config.transitions}
          style={config.style}
          directorIntent={config.directorIntent}
          beatRules={config.beatRules}
        />
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════
  // MOBILE LAYOUT (< 768px)
  // Full-screen scrollable with bottom navigation bar
  // ══════════════════════════════════════════════════════════
  if (device === 'mobile') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-auto pb-20 safe-area-bottom">
          <div className="px-3 py-3 space-y-3">

            {/* Collapsible media section */}
            <button
              onClick={() => setMediaCollapsed(!mediaCollapsed)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-card/80 border border-border/40 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold">
                  {file ? file.name : 'Source Media & Preview'}
                </span>
                {file && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">Ready</span>
                )}
              </div>
              {mediaCollapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
            </button>

            {!mediaCollapsed && (
              <div className="space-y-3 animate-fade-in">
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
                  videoRef={previewVideoRef}
                  canvasRef={previewCanvasRef}
                  onTimeUpdate={handleVideoTimeUpdate}
                />
                <EditingCanvas
                  file={file}
                  detectedFormat={detectedFormat}
                  colorGrade={config.colorGrade}
                  effectPreset={config.effectPreset}
                  transitions={config.transitions}
                  graphics={config.graphics}
                  isProcessing={isProcessing}
                  audioAnalysis={audioAnalysis}
                  videoAnalysis={videoAnalysis}
                  onPlayheadChange={handlePlayheadFromCanvas}
                />
              </div>
            )}

            {/* Tool panel content */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
              <TabsList className="sr-only">
                {toolSections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="min-h-[50vh]">
                {renderToolContent()}
              </div>
            </Tabs>

            {/* Workflow Progress - Below main content on mobile */}
            <VisualWorkflowIndicator {...workflowIndicatorProps} orientation="horizontal" />

            {/* Side panel (rules + output) below tools on mobile */}
            <div className="space-y-3 pt-2 border-t border-border/30">
              {renderSidePanel()}
            </div>
          </div>
        </main>

        {/* ── Bottom navigation bar ── */}
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
          <div className="flex overflow-x-auto scrollbar-hide gap-0.5 px-1 py-1.5">
            {toolSections.map((section) => {
              const active = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabChange(section.id)}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[52px]',
                    active
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'text-muted-foreground active:bg-muted/50'
                  )}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <span className={cn('text-[9px] font-semibold leading-none', active && 'text-primary-foreground')}>
                    {section.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

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

  // ══════════════════════════════════════════════════════════
  // TABLET LAYOUT (768px - 1023px)
  // Two-column: media + tools on left, output on right
  // Bottom nav for tool switching
  // ══════════════════════════════════════════════════════════
  if (device === 'tablet') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 overflow-hidden flex">
          {/* Left column: media + tools */}
          <div className="flex-1 overflow-auto pb-16">
            <div className="p-4 space-y-4">
              {/* Media row - 2 column on tablet */}
              <div className="grid grid-cols-2 gap-3">
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
                  videoRef={previewVideoRef}
                  canvasRef={previewCanvasRef}
                  onTimeUpdate={handleVideoTimeUpdate}
                />
              </div>

              <EditingCanvas
                file={file}
                detectedFormat={detectedFormat}
                colorGrade={config.colorGrade}
                effectPreset={config.effectPreset}
                transitions={config.transitions}
                graphics={config.graphics}
                isProcessing={isProcessing}
                audioAnalysis={audioAnalysis}
                videoAnalysis={videoAnalysis}
                onPlayheadChange={handlePlayheadFromCanvas}
              />

              {/* Tool content */}
              <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
                <TabsList className="sr-only">
                  {toolSections.map((section) => (
                    <TabsTrigger key={section.id} value={section.id}>
                      {section.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {renderToolContent()}
              </Tabs>

              {/* Workflow Progress - Below main content on tablet */}
              <div className="mt-4">
                <VisualWorkflowIndicator {...workflowIndicatorProps} orientation="horizontal" />
              </div>
            </div>
          </div>

          {/* Right column: rules + output */}
          <div className="w-[320px] border-l border-border/40 overflow-auto pb-16 bg-card/20">
            <div className="p-4 space-y-4">
              {renderSidePanel()}
            </div>
          </div>
        </main>

        {/* ── Bottom navigation bar for tablets ── */}
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40">
          <div className="flex justify-center gap-1 px-2 py-2">
            {toolSections.map((section) => {
              const active = activeTab === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabChange(section.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                    active
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {section.icon}
                  {active && <span>{section.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

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

  // ══════════════════════════════════════════════════════════
  // DESKTOP LAYOUT (>= 1024px)
  // Full resizable panel layout with vertical tool rail
  // ══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Draft Recovery Banner */}
      {showRecoveryBanner && draftInfo && (
        <DraftRecoveryBanner
          savedAt={draftInfo.savedAt}
          fileName={draftInfo.fileName}
          onRestore={restoreDraft}
          onDiscard={discardDraft}
          onDismiss={dismissBanner}
        />
      )}
      
      {/* Keyboard Shortcuts Overlay */}
      {showShortcutsOverlay && (
        <KeyboardShortcutsOverlay
          shortcuts={shortcuts}
          onClose={() => setShowShortcutsOverlay(false)}
        />
      )}

      <main className="h-[calc(100vh-56px)] overflow-hidden">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Top section - Source & Timeline Preview */}
          <ResizablePanel defaultSize={35} minSize={15} maxSize={70} className="overflow-hidden">
            <div className="h-full bg-card/30 backdrop-blur-sm overflow-auto">
              <div className="px-4 py-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
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
                    videoRef={previewVideoRef}
                    canvasRef={previewCanvasRef}
                    onTimeUpdate={handleVideoTimeUpdate}
                  />
                  <TimelineVisualizerDetailed
                    fileContent={fileContent}
                    isProcessing={isProcessing}
                    detectedFormat={detectedFormat}
                    detectedBPM={detectedBPM}
                  />
                </div>
                {/* Editing Canvas - Full width timeline with effect indicators */}
                <EditingCanvas
                  file={file}
                  detectedFormat={detectedFormat}
                  colorGrade={config.colorGrade}
                  effectPreset={config.effectPreset}
                  transitions={config.transitions}
                  graphics={config.graphics}
                  isProcessing={isProcessing}
                  audioAnalysis={audioAnalysis}
                  videoAnalysis={videoAnalysis}
                  onClipSelect={(clipId) => clipId && trackFeatureUse('clip-select')}
                  onPlayheadChange={handlePlayheadFromCanvas}
                />
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
                  <div className="h-full flex gap-4">
                    {/* Desktop vertical rail - scrollable & searchable */}
                    <ToolRail
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                      recentTools={preferences.recentTools || []}
                      favoriteTools={preferences.favoriteTools || []}
                    />

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex-1 flex flex-col">
                      <TabsList className="sr-only">
                        {toolSections.map((section) => (
                          <TabsTrigger key={section.id} value={section.id}>
                            {section.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <div className="flex-1 overflow-auto pr-1">
                        {renderToolContent()}
                      </div>
                    </Tabs>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="hover:bg-primary/10 transition-colors" />

                {/* Right - Output + Workflow */}
                <ResizablePanel defaultSize={35} minSize={15} maxSize={50} className="overflow-auto pl-4">
                  {/* Workflow Progress - Vertical sidebar on desktop */}
                  <div className="mb-4">
                    <VisualWorkflowIndicator {...workflowIndicatorProps} orientation="vertical" />
                  </div>
                  {renderSidePanel()}
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

      {/* Quick Export Bar - Sticky Bottom */}
      <QuickExportBar
        outputXml={outputXml}
        isProcessing={isProcessing}
        progress={progress}
        canGenerate={canGenerate}
        exportFormat={config.exportFormat}
        onGenerate={handleGenerate}
        onExport={handleQuickExport}
        inputFilename={file?.name}
      />

      {/* Welcome guide for new users */}
      {showWelcome && (
        <WelcomeGuide
          onComplete={() => {
            setShowWelcome(false);
            completeOnboarding();
          }}
          onDismiss={() => {
            setShowWelcome(false);
            completeOnboarding();
          }}
        />
      )}
    </div>
  );
}
