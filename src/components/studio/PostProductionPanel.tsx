import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wand2,
  Volume2,
  Music,
  Film,
  Sparkles,
  Eye,
  Palette,
  Zap,
  Clock,
  Layers,
  Sliders,
  Clapperboard,
  Disc,
  AudioLines,
  Gauge,
  RefreshCw,
  Check,
  SunMedium,
  Contrast,
  Focus,
  Waves,
  Activity,
} from 'lucide-react';

export interface PostProductionSettings {
  // Audio Mastering
  audioNormalization: boolean;
  audioNormalizationTarget: number;
  audioCompression: number;
  audioEQ: 'flat' | 'warm' | 'bright' | 'bass-boost' | 'vocal-enhance';
  audioFadeIn: number;
  audioFadeOut: number;
  ducking: boolean;
  duckingAmount: number;

  // Color Finalization
  colorFinalization: boolean;
  globalSaturation: number;
  globalContrast: number;
  globalBrightness: number;
  filmGrain: number;
  vignette: number;
  lensDistortion: number;

  // Motion & Speed
  motionBlur: boolean;
  motionBlurAmount: number;
  stabilization: boolean;
  stabilizationStrength: number;
  speedRamping: boolean;

  // Final Output
  outputSharpening: number;
  noiseReduction: number;
  colorSpace: 'rec709' | 'rec2020' | 'dcip3' | 'srgb';
  bitDepth: '8bit' | '10bit' | '12bit';
  frameInterpolation: boolean;
  targetFrameRate: number;

  // AI Enhancement
  aiUpscale: boolean;
  aiDenoising: boolean;
  aiColorCorrection: boolean;
  aiAudioEnhancement: boolean;
}

export const DEFAULT_POST_PRODUCTION: PostProductionSettings = {
  audioNormalization: true,
  audioNormalizationTarget: -14,
  audioCompression: 0.3,
  audioEQ: 'flat',
  audioFadeIn: 0.5,
  audioFadeOut: 1,
  ducking: true,
  duckingAmount: 0.6,

  colorFinalization: true,
  globalSaturation: 1,
  globalContrast: 1,
  globalBrightness: 1,
  filmGrain: 0.05,
  vignette: 0.1,
  lensDistortion: 0,

  motionBlur: false,
  motionBlurAmount: 0.5,
  stabilization: false,
  stabilizationStrength: 0.5,
  speedRamping: false,

  outputSharpening: 0.3,
  noiseReduction: 0.2,
  colorSpace: 'rec709',
  bitDepth: '10bit',
  frameInterpolation: false,
  targetFrameRate: 24,

  aiUpscale: false,
  aiDenoising: false,
  aiColorCorrection: true,
  aiAudioEnhancement: true,
};

interface PostProductionPanelProps {
  settings: PostProductionSettings;
  onSettingsChange: (settings: PostProductionSettings) => void;
  disabled?: boolean;
}

export default function PostProductionPanel({
  settings,
  onSettingsChange,
  disabled,
}: PostProductionPanelProps) {
  const [activeTab, setActiveTab] = useState('audio');

  const update = (key: keyof PostProductionSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resetToDefaults = () => {
    onSettingsChange(DEFAULT_POST_PRODUCTION);
  };

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-3.5 h-3.5 text-primary" />
            <span className="panel-title">Post-Production</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] gap-1"
            onClick={resetToDefaults}
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-9">
            <TabsTrigger value="audio" className="text-[10px] gap-1">
              <Volume2 className="w-3 h-3" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="color" className="text-[10px] gap-1">
              <Palette className="w-3 h-3" />
              Color
            </TabsTrigger>
            <TabsTrigger value="motion" className="text-[10px] gap-1">
              <Activity className="w-3 h-3" />
              Motion
            </TabsTrigger>
            <TabsTrigger value="output" className="text-[10px] gap-1">
              <Sliders className="w-3 h-3" />
              Output
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-[10px] gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px]">
            {/* Audio Tab */}
            <TabsContent value="audio" className="p-4 space-y-4 m-0">
              {/* Normalization */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Loudness Normalization</span>
                  </div>
                  <Switch
                    checked={settings.audioNormalization}
                    onCheckedChange={(v) => update('audioNormalization', v)}
                    disabled={disabled}
                  />
                </div>
                {settings.audioNormalization && (
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Target LUFS</span>
                      <span className="font-mono">{settings.audioNormalizationTarget} dB</span>
                    </div>
                    <Slider
                      value={[settings.audioNormalizationTarget]}
                      min={-24}
                      max={-6}
                      step={1}
                      onValueChange={([v]) => update('audioNormalizationTarget', v)}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>

              {/* Compression */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Dynamic Compression</span>
                  <span className="font-mono">{Math.round(settings.audioCompression * 100)}%</span>
                </div>
                <Slider
                  value={[settings.audioCompression]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => update('audioCompression', v)}
                  disabled={disabled}
                />
              </div>

              {/* EQ Preset */}
              <div className="space-y-2">
                <span className="text-xs font-medium">EQ Preset</span>
                <Select
                  value={settings.audioEQ}
                  onValueChange={(v) => update('audioEQ', v)}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="bright">Bright</SelectItem>
                    <SelectItem value="bass-boost">Bass Boost</SelectItem>
                    <SelectItem value="vocal-enhance">Vocal Enhance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fades */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Fade In</span>
                    <span className="font-mono">{settings.audioFadeIn}s</span>
                  </div>
                  <Slider
                    value={[settings.audioFadeIn]}
                    min={0}
                    max={5}
                    step={0.1}
                    onValueChange={([v]) => update('audioFadeIn', v)}
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Fade Out</span>
                    <span className="font-mono">{settings.audioFadeOut}s</span>
                  </div>
                  <Slider
                    value={[settings.audioFadeOut]}
                    min={0}
                    max={5}
                    step={0.1}
                    onValueChange={([v]) => update('audioFadeOut', v)}
                    disabled={disabled}
                  />
                </div>
              </div>

              {/* Ducking */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AudioLines className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Audio Ducking</span>
                  </div>
                  <Switch
                    checked={settings.ducking}
                    onCheckedChange={(v) => update('ducking', v)}
                    disabled={disabled}
                  />
                </div>
                {settings.ducking && (
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Duck Amount</span>
                      <span className="font-mono">{Math.round(settings.duckingAmount * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.duckingAmount]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => update('duckingAmount', v)}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Color Tab */}
            <TabsContent value="color" className="p-4 space-y-4 m-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Color Finalization</span>
                </div>
                <Switch
                  checked={settings.colorFinalization}
                  onCheckedChange={(v) => update('colorFinalization', v)}
                  disabled={disabled}
                />
              </div>

              {settings.colorFinalization && (
                <div className="space-y-4">
                  {/* Global adjustments */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <SunMedium className="w-3 h-3" />
                        <span>Brightness</span>
                      </div>
                      <span className="font-mono">{settings.globalBrightness.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[settings.globalBrightness]}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      onValueChange={([v]) => update('globalBrightness', v)}
                      disabled={disabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Contrast className="w-3 h-3" />
                        <span>Contrast</span>
                      </div>
                      <span className="font-mono">{settings.globalContrast.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[settings.globalContrast]}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      onValueChange={([v]) => update('globalContrast', v)}
                      disabled={disabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Palette className="w-3 h-3" />
                        <span>Saturation</span>
                      </div>
                      <span className="font-mono">{settings.globalSaturation.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[settings.globalSaturation]}
                      min={0}
                      max={2}
                      step={0.01}
                      onValueChange={([v]) => update('globalSaturation', v)}
                      disabled={disabled}
                    />
                  </div>

                  {/* Film effects */}
                  <div className="pt-2 border-t border-border/40 space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground">Film Effects</span>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Film Grain</span>
                        <span className="font-mono">{Math.round(settings.filmGrain * 100)}%</span>
                      </div>
                      <Slider
                        value={[settings.filmGrain]}
                        min={0}
                        max={0.5}
                        step={0.01}
                        onValueChange={([v]) => update('filmGrain', v)}
                        disabled={disabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Vignette</span>
                        <span className="font-mono">{Math.round(settings.vignette * 100)}%</span>
                      </div>
                      <Slider
                        value={[settings.vignette]}
                        min={0}
                        max={0.5}
                        step={0.01}
                        onValueChange={([v]) => update('vignette', v)}
                        disabled={disabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Lens Distortion</span>
                        <span className="font-mono">{Math.round(settings.lensDistortion * 100)}%</span>
                      </div>
                      <Slider
                        value={[settings.lensDistortion]}
                        min={-0.2}
                        max={0.2}
                        step={0.01}
                        onValueChange={([v]) => update('lensDistortion', v)}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Motion Tab */}
            <TabsContent value="motion" className="p-4 space-y-4 m-0">
              {/* Motion Blur */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Motion Blur</span>
                  </div>
                  <Switch
                    checked={settings.motionBlur}
                    onCheckedChange={(v) => update('motionBlur', v)}
                    disabled={disabled}
                  />
                </div>
                {settings.motionBlur && (
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-mono">{Math.round(settings.motionBlurAmount * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.motionBlurAmount]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => update('motionBlurAmount', v)}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>

              {/* Stabilization */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Focus className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Stabilization</span>
                  </div>
                  <Switch
                    checked={settings.stabilization}
                    onCheckedChange={(v) => update('stabilization', v)}
                    disabled={disabled}
                  />
                </div>
                {settings.stabilization && (
                  <div className="pl-6 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Strength</span>
                      <span className="font-mono">{Math.round(settings.stabilizationStrength * 100)}%</span>
                    </div>
                    <Slider
                      value={[settings.stabilizationStrength]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => update('stabilizationStrength', v)}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>

              {/* Speed Ramping */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <div>
                    <span className="text-xs font-semibold">Speed Ramping</span>
                    <p className="text-[10px] text-muted-foreground">Auto smooth speed transitions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.speedRamping}
                  onCheckedChange={(v) => update('speedRamping', v)}
                  disabled={disabled}
                />
              </div>
            </TabsContent>

            {/* Output Tab */}
            <TabsContent value="output" className="p-4 space-y-4 m-0">
              {/* Sharpening */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Output Sharpening</span>
                  <span className="font-mono">{Math.round(settings.outputSharpening * 100)}%</span>
                </div>
                <Slider
                  value={[settings.outputSharpening]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => update('outputSharpening', v)}
                  disabled={disabled}
                />
              </div>

              {/* Noise Reduction */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Noise Reduction</span>
                  <span className="font-mono">{Math.round(settings.noiseReduction * 100)}%</span>
                </div>
                <Slider
                  value={[settings.noiseReduction]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => update('noiseReduction', v)}
                  disabled={disabled}
                />
              </div>

              {/* Color Space */}
              <div className="space-y-2">
                <span className="text-xs font-medium">Color Space</span>
                <Select
                  value={settings.colorSpace}
                  onValueChange={(v) => update('colorSpace', v)}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rec709">Rec. 709 (SDR)</SelectItem>
                    <SelectItem value="rec2020">Rec. 2020 (HDR)</SelectItem>
                    <SelectItem value="dcip3">DCI-P3</SelectItem>
                    <SelectItem value="srgb">sRGB (Web)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bit Depth */}
              <div className="space-y-2">
                <span className="text-xs font-medium">Bit Depth</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['8bit', '10bit', '12bit'] as const).map((depth) => (
                    <Button
                      key={depth}
                      variant={settings.bitDepth === depth ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => update('bitDepth', depth)}
                      disabled={disabled}
                    >
                      {depth}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Frame Interpolation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold">Frame Interpolation</span>
                  </div>
                  <Switch
                    checked={settings.frameInterpolation}
                    onCheckedChange={(v) => update('frameInterpolation', v)}
                    disabled={disabled}
                  />
                </div>
                {settings.frameInterpolation && (
                  <div className="pl-6 space-y-2">
                    <span className="text-xs text-muted-foreground">Target Frame Rate</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[24, 30, 60, 120].map((fps) => (
                        <Button
                          key={fps}
                          variant={settings.targetFrameRate === fps ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-[10px]"
                          onClick={() => update('targetFrameRate', fps)}
                          disabled={disabled}
                        >
                          {fps}fps
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* AI Tab */}
            <TabsContent value="ai" className="p-4 space-y-4 m-0">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-semibold">AI Enhancement Suite</p>
                  <p className="text-[10px] text-muted-foreground">Powered by Lovable AI</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'aiUpscale' as const,
                    icon: <Eye className="w-4 h-4" />,
                    title: 'AI Upscaling',
                    desc: 'Enhance resolution up to 4K',
                  },
                  {
                    key: 'aiDenoising' as const,
                    icon: <Sparkles className="w-4 h-4" />,
                    title: 'AI Denoising',
                    desc: 'Remove noise while preserving detail',
                  },
                  {
                    key: 'aiColorCorrection' as const,
                    icon: <Palette className="w-4 h-4" />,
                    title: 'AI Color Correction',
                    desc: 'Auto color matching across clips',
                  },
                  {
                    key: 'aiAudioEnhancement' as const,
                    icon: <Music className="w-4 h-4" />,
                    title: 'AI Audio Enhancement',
                    desc: 'Improve clarity and remove background noise',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border transition-all',
                      settings[item.key]
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-muted/30 border-border/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        settings[item.key] ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[item.key]}
                      onCheckedChange={(v) => update(item.key, v)}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}
