import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Send, 
  Wand2, 
  Zap, 
  Music, 
  Film, 
  Smartphone,
  RefreshCw,
  Check,
  Bot,
  User,
  Loader2,
  Play,
  TrendingUp,
  Heart,
  Moon,
  Sun,
  Flame,
  Palette
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedConfig?: Partial<EditConfig>;
}

interface EditConfig {
  style: string;
  colorGrade: string;
  effectPreset: string;
  directorIntent: string | null;
  transitions: string[];
  beatRules: string[];
}

interface VibePreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  gradient: string;
}

const VIBE_PRESETS: VibePreset[] = [
  {
    id: 'hype-music',
    name: 'Hype Music Video',
    icon: <Flame className="w-5 h-5" />,
    description: 'High-energy cuts, beat-synced, bold colors',
    prompt: 'Create an intense hype music video edit with fast cuts on every beat, bold neon colors, glitch transitions, and maximum energy. Think Travis Scott or Drake video vibes.',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: 'dreamy-aesthetic',
    name: 'Dreamy Aesthetic',
    icon: <Moon className="w-5 h-5" />,
    description: 'Soft, ethereal, pastel vibes',
    prompt: 'Create a dreamy, ethereal aesthetic with soft pastel colors, slow dissolves, gentle camera movements, and a nostalgic feel. Think indie or shoegaze music video.',
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    id: 'cinematic-epic',
    name: 'Cinematic Epic',
    icon: <Film className="w-5 h-5" />,
    description: 'Movie-quality, dramatic grading',
    prompt: 'Create a cinematic, epic feel like a movie trailer with teal-orange grading, dramatic pacing, and powerful transitions. Think Hans Zimmer soundtrack vibes.',
    gradient: 'from-cyan-500 to-orange-500',
  },
  {
    id: 'viral-tiktok',
    name: 'Viral TikTok',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'Trending effects, quick cuts, engaging',
    prompt: 'Create a TikTok-ready viral edit with trendy effects, zoom punches, quick cuts, and high contrast colors that pop on mobile. Make it scroll-stopping.',
    gradient: 'from-pink-500 to-violet-600',
  },
  {
    id: 'lo-fi-nostalgic',
    name: 'Lo-Fi Nostalgic',
    icon: <Heart className="w-5 h-5" />,
    description: 'VHS, film grain, warm tones',
    prompt: 'Create a nostalgic lo-fi aesthetic with VHS effects, film grain, warm vintage colors, and a cozy, intimate feel. Think 90s home video or indie film.',
    gradient: 'from-amber-400 to-rose-500',
  },
  {
    id: 'dark-moody',
    name: 'Dark & Moody',
    icon: <Moon className="w-5 h-5" />,
    description: 'Shadows, contrast, intense',
    prompt: 'Create a dark, moody edit with deep shadows, high contrast, desaturated colors, and an intense, mysterious atmosphere. Think thriller or dark R&B.',
    gradient: 'from-slate-700 to-slate-900',
  },
];

interface AIVibeStudioProps {
  currentConfig: Partial<EditConfig>;
  onApplyConfig: (config: Partial<EditConfig>) => void;
  file?: File | null;
  detectedBPM?: number | null;
}

export default function AIVibeStudio({ 
  currentConfig, 
  onApplyConfig, 
  file,
  detectedBPM 
}: AIVibeStudioProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoVibeResult, setAutoVibeResult] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse AI response for config suggestions
  const parseConfigFromResponse = (content: string): Partial<EditConfig> | null => {
    const match = content.match(/\[APPLY_CONFIG\](.*?)\[\/APPLY_CONFIG\]/s);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    }
    return null;
  };

  // Stream chat with AI
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-vibe-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
            currentConfig,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
          }
          return [...prev, { role: 'assistant', content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              updateAssistant(assistantContent + delta);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Parse config suggestions
      const suggestedConfig = parseConfigFromResponse(assistantContent);
      if (suggestedConfig) {
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant') {
            updated[lastIdx] = { 
              ...updated[lastIdx], 
              suggestedConfig,
              content: updated[lastIdx].content.replace(/\[APPLY_CONFIG\].*?\[\/APPLY_CONFIG\]/s, '').trim()
            };
          }
          return updated;
        });
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response',
      });
      setMessages(prev => prev.filter(m => m !== userMessage));
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentConfig, isLoading, toast]);

  // Auto-analyze video for vibe suggestions
  const analyzeForVibe = useCallback(async () => {
    if (!file) {
      toast({ title: 'No file', description: 'Upload a video first to auto-detect vibe' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-auto-vibe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            detectedBPM,
          }),
        }
      );

      const data = await response.json();
      if (data.success && data.analysis) {
        setAutoVibeResult(data.analysis);
        toast({
          title: '✨ Vibe Detected!',
          description: `${data.analysis.directorIntent} vibe with ${Math.round(data.analysis.confidence * 100)}% confidence`,
        });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Analysis failed', description: 'Could not analyze video' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, detectedBPM, toast]);

  // Apply a vibe preset
  const applyVibePreset = (preset: VibePreset) => {
    sendMessage(preset.prompt);
  };

  // Apply suggested config
  const applySuggestedConfig = (config: Partial<EditConfig>) => {
    onApplyConfig(config);
    toast({ title: '✨ Vibe Applied!', description: 'Your edit style has been updated' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Vibe Studio</h2>
            <p className="text-xs text-muted-foreground">Describe your vision, let AI do the rest</p>
          </div>
        </div>

        {/* Auto-detect button */}
        <Button
          variant="outline"
          size="sm"
          onClick={analyzeForVibe}
          disabled={!file || isAnalyzing}
          className="w-full gap-2 bg-card/50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing vibe...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Auto-Detect Vibe from Video
            </>
          )}
        </Button>

        {/* Auto vibe result */}
        {autoVibeResult && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold">Detected Vibe</span>
              <Badge variant="secondary" className="text-[10px]">
                {Math.round(autoVibeResult.confidence * 100)}% match
              </Badge>
            </div>
            <p className="text-sm font-bold capitalize mb-1">{autoVibeResult.directorIntent}</p>
            <p className="text-xs text-muted-foreground mb-2">{autoVibeResult.reasoning}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {autoVibeResult.vibeKeywords?.map((kw: string) => (
                <Badge key={kw} variant="outline" className="text-[9px]">{kw}</Badge>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full gap-2"
              onClick={() => applySuggestedConfig({
                style: autoVibeResult.suggestedStyle,
                colorGrade: autoVibeResult.suggestedColorGrade,
                effectPreset: autoVibeResult.suggestedEffects,
                directorIntent: autoVibeResult.directorIntent,
                transitions: autoVibeResult.suggestedTransitions,
                beatRules: autoVibeResult.suggestedBeatRules,
              })}
            >
              <Check className="w-4 h-4" />
              Apply This Vibe
            </Button>
          </div>
        )}
      </div>

      {/* Quick Vibe Presets */}
      <div className="p-3 border-b border-border/40">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-1">Quick Vibes</p>
        <div className="grid grid-cols-2 gap-2">
          {VIBE_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyVibePreset(preset)}
              disabled={isLoading}
              className={cn(
                'p-2.5 rounded-xl text-left transition-all group',
                'bg-gradient-to-br hover:scale-[1.02] active:scale-[0.98]',
                preset.gradient,
                'text-white shadow-lg'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {preset.icon}
                <span className="text-xs font-bold">{preset.name}</span>
              </div>
              <p className="text-[10px] opacity-80 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Tell me about your video and I'll suggest the perfect vibe ✨
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Try: "Make this look like a Travis Scott video" or "I want a dreamy indie vibe"
              </p>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={cn(
                'flex gap-2',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted rounded-bl-md'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Show apply button for suggestions */}
                {message.suggestedConfig && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full gap-2"
                    onClick={() => applySuggestedConfig(message.suggestedConfig!)}
                  >
                    <Check className="w-3 h-3" />
                    Apply These Settings
                  </Button>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border/40 bg-card/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your vibe... (e.g., 'dark cinematic horror')"
            disabled={isLoading}
            className="flex-1 bg-background/50"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
