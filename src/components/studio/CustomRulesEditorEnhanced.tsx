import { useState, useCallback, useMemo, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Wand2, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  Sparkles,
  Zap,
  Film,
  Music,
  Palette,
  Clock,
  Target,
  Heart,
  Flame,
  Star,
  Camera,
  Volume2,
  Plus,
  Check,
  Expand,
  X,
  Tv,
  Clapperboard,
  Radio,
  Megaphone,
  GraduationCap,
  PartyPopper,
  Glasses,
  Sword,
  Ghost,
  Sunset,
  Mountain,
  Eye,
  Search,
  ArrowRight,
  ChevronLeft,
  Grid3X3,
  LayoutList,
  Play,
  Bookmark,
  BookmarkCheck,
  Save,
  Trash2,
  Edit3,
  FolderPlus,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface CustomRulesEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Vision templates for one-click powerful edits
const VISION_TEMPLATES = [
  {
    id: 'cinematic_drama',
    icon: Film,
    label: 'Cinematic Drama',
    category: 'Film',
    description: 'Hollywood-style dramatic editing with emotional pacing and film aesthetics',
    color: 'from-amber-500 to-orange-600',
    rules: `STYLE: Cinematic Film Grade
- Long holds on emotional beats (3-5 seconds)
- Slow push-ins on close-ups
- Dramatic pauses before key moments
- Cross dissolves between scenes (1.5s)
- Desaturated shadows, warm highlights
- Film grain overlay (4%)
- 2.39:1 letterboxing`
  },
  {
    id: 'music_video_hype',
    icon: Music,
    label: 'Music Video Hype',
    category: 'Music',
    description: 'High-energy beat-synced editing for music videos and performances',
    color: 'from-purple-500 to-pink-600',
    rules: `STYLE: High-Energy Music Edit
- Cut on EVERY beat during chorus
- Quick jump cuts during verses (0.3-0.5s)
- Speed ramps on bass drops (200% to 50%)
- Flash to white on beat drops
- Zoom pulse on snare hits (108%)
- Whip pans between scenes
- Vibrant saturation boost (+25%)`
  },
  {
    id: 'viral_tiktok',
    icon: Flame,
    label: 'Viral TikTok',
    category: 'Social',
    description: 'Fast-paced vertical content optimized for social media engagement',
    color: 'from-rose-500 to-red-600',
    rules: `STYLE: TikTok Viral Formula
- Hook in first 0.5 seconds (zoom, flash, text)
- Average shot length under 1 second
- Jump cuts with slight zooms
- On-screen captions for key moments
- Trending sound sync on beats
- 9:16 vertical framing
- High contrast + saturation`
  },
  {
    id: 'emotional_slow',
    icon: Heart,
    label: 'Emotional Slow',
    category: 'Film',
    description: 'Reflective and emotional pacing with slow motion and soft transitions',
    color: 'from-blue-500 to-indigo-600',
    rules: `STYLE: Emotional & Reflective
- Slow motion on all emotional peaks (50%)
- Long cross dissolves (2-3 seconds)
- Hold on reactions and faces
- Soft vignette (20%)
- Subtle film grain (2%)
- Cool shadows, warm skin tones
- Piano/strings sync for cuts`
  },
  {
    id: 'documentary_raw',
    icon: Camera,
    label: 'Documentary Raw',
    category: 'Documentary',
    description: 'Authentic documentary style with natural timing and interview-driven cuts',
    color: 'from-emerald-500 to-teal-600',
    rules: `STYLE: Raw Documentary
- Natural timing, no beat sync
- J-cuts and L-cuts for flow
- Handheld shake preserved
- Interview audio drives cuts
- B-roll inserts on keywords
- Minimal color grading
- Lower thirds for speakers`
  },
  {
    id: 'trailer_epic',
    icon: Star,
    label: 'Epic Trailer',
    category: 'Film',
    description: 'Blockbuster trailer format with tension builds and dramatic reveals',
    color: 'from-yellow-500 to-amber-600',
    rules: `STYLE: Blockbuster Trailer
- Build tension with increasing cut pace
- Black flash hits on impacts
- Bass boom transitions
- Title cards between acts
- Slow-mo hero moments
- 3-act structure (Setup, Rise, Climax)
- End on cliffhanger/question`
  },
  {
    id: 'commercial_product',
    icon: Tv,
    label: 'Product Commercial',
    category: 'Commercial',
    description: 'Clean, professional product showcase with smooth reveals',
    color: 'from-cyan-500 to-blue-600',
    rules: `STYLE: Product Commercial
- Smooth dolly/slider moves
- Clean white or gradient backgrounds
- Product hero shots (2-3 seconds hold)
- Motion graphics on features
- Upbeat music sync on reveals
- Pack shot at end (3 seconds)
- Call-to-action overlay`
  },
  {
    id: 'horror_tension',
    icon: Ghost,
    label: 'Horror Tension',
    category: 'Film',
    description: 'Suspenseful horror editing with jump scares and dread building',
    color: 'from-slate-700 to-slate-900',
    rules: `STYLE: Horror/Thriller
- Long uncomfortable holds (5-8 seconds)
- Sudden hard cuts for jump scares
- Desaturated, cold color grade
- Audio stingers on cuts
- Slow creeping zooms
- Black frames before reveals
- Low frequency rumble builds`
  },
  {
    id: 'action_intense',
    icon: Sword,
    label: 'Action Intense',
    category: 'Film',
    description: 'Fast-paced action sequences with impact cuts and speed ramping',
    color: 'from-red-600 to-orange-600',
    rules: `STYLE: Action Sequence
- Rapid cuts during fights (0.2-0.5s)
- Speed ramp on impacts (150% → 50% → 100%)
- Camera shake on hits
- Sound design sync (punch = cut)
- Wide → close → wide pattern
- Slow-mo on finishing moves
- High contrast, crushed blacks`
  },
  {
    id: 'wedding_romantic',
    icon: PartyPopper,
    label: 'Wedding Romance',
    category: 'Events',
    description: 'Romantic wedding film style with soft colors and emotional moments',
    color: 'from-pink-400 to-rose-500',
    rules: `STYLE: Wedding Film
- Slow motion on key moments (60%)
- Soft, airy color grade
- Long dissolves between scenes (2s)
- Vows audio over B-roll montage
- Golden hour warmth boost
- Film grain (3%)
- Gentle lens flares allowed`
  },
  {
    id: 'corporate_clean',
    icon: GraduationCap,
    label: 'Corporate Clean',
    category: 'Commercial',
    description: 'Professional corporate video style with clear messaging',
    color: 'from-blue-600 to-indigo-700',
    rules: `STYLE: Corporate/B2B
- Clean, professional cuts
- Interview-driven narrative
- B-roll supports talking points
- Lower thirds with titles
- Brand color accents
- Consistent 3-second minimum shots
- End with logo + CTA`
  },
  {
    id: 'vlog_personal',
    icon: Radio,
    label: 'Vlog Personal',
    category: 'Social',
    description: 'Casual vlog style with personality and quick pacing',
    color: 'from-orange-500 to-yellow-500',
    rules: `STYLE: Personal Vlog
- Jump cuts to remove pauses
- Zoom punches on emphasis (110%)
- Text overlays for humor
- B-roll cutaways (1-2 seconds)
- Music bed under narration
- Face cam priority
- Subscribe reminder at end`
  },
  {
    id: 'nature_ambient',
    icon: Mountain,
    label: 'Nature Ambient',
    category: 'Documentary',
    description: 'Peaceful nature documentary with ambient pacing',
    color: 'from-green-500 to-emerald-600',
    rules: `STYLE: Nature/Ambient
- Long establishing shots (5-10 seconds)
- Slow, smooth transitions
- Natural sound priority
- Timelapse for clouds/light
- Slow motion wildlife (40%)
- Rich, natural color grade
- Minimal text overlays`
  },
  {
    id: 'retro_80s',
    icon: Glasses,
    label: 'Retro 80s',
    category: 'Stylized',
    description: 'Synthwave-inspired retro aesthetic with neon colors',
    color: 'from-fuchsia-500 to-purple-700',
    rules: `STYLE: 80s Retro/Synthwave
- VHS scan lines overlay
- Neon pink/cyan color grade
- Grid graphics and chrome text
- Slow zoom outs
- Synth music sync
- Soft glow on highlights
- 4:3 crop option for authenticity`
  },
  {
    id: 'tutorial_educational',
    icon: Eye,
    label: 'Tutorial Clear',
    category: 'Educational',
    description: 'Clear educational format with annotations and callouts',
    color: 'from-teal-500 to-cyan-600',
    rules: `STYLE: Tutorial/Educational
- Screen recording priority
- Zoom to areas of focus (150%)
- Highlight cursor movements
- Step-by-step title cards
- Clear audio priority
- Callout boxes on key points
- Chapter markers for navigation`
  },
  {
    id: 'sunset_golden',
    icon: Sunset,
    label: 'Golden Hour',
    category: 'Stylized',
    description: 'Warm, golden hour aesthetic with dreamy visuals',
    color: 'from-amber-400 to-orange-500',
    rules: `STYLE: Golden Hour/Dreamy
- Warm orange/gold color grade
- Soft highlights, no clipping
- Lens flares enhanced
- Slow motion (70%)
- Long dissolves (2-3 seconds)
- Hazy/soft filter look
- Gentle vignette (15%)`
  },
];

const TEMPLATE_CATEGORIES = ['All', 'Favorites', 'My Templates', 'Film', 'Music', 'Social', 'Documentary', 'Commercial', 'Events', 'Educational', 'Stylized'];

// Storage keys
const FAVORITES_STORAGE_KEY = 'vision-template-favorites';
const CUSTOM_TEMPLATES_STORAGE_KEY = 'vision-custom-templates';

// Custom template type
interface CustomTemplate {
  id: string;
  icon: string;
  label: string;
  category: string;
  description: string;
  color: string;
  rules: string;
  isCustom: true;
  createdAt: number;
}

// Icon mapping for custom templates
const CUSTOM_ICON_OPTIONS = [
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'flame', icon: Flame, label: 'Flame' },
  { id: 'film', icon: Film, label: 'Film' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'camera', icon: Camera, label: 'Camera' },
  { id: 'palette', icon: Palette, label: 'Palette' },
  { id: 'zap', icon: Zap, label: 'Zap' },
  { id: 'target', icon: Target, label: 'Target' },
  { id: 'sparkles', icon: Sparkles, label: 'Sparkles' },
];

const CUSTOM_COLOR_OPTIONS = [
  { id: 'purple', value: 'from-purple-500 to-pink-600' },
  { id: 'blue', value: 'from-blue-500 to-indigo-600' },
  { id: 'green', value: 'from-emerald-500 to-teal-600' },
  { id: 'orange', value: 'from-amber-500 to-orange-600' },
  { id: 'red', value: 'from-rose-500 to-red-600' },
  { id: 'cyan', value: 'from-cyan-500 to-blue-600' },
  { id: 'pink', value: 'from-pink-400 to-rose-500' },
  { id: 'yellow', value: 'from-yellow-500 to-amber-600' },
];

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'All': Grid3X3,
  'Favorites': BookmarkCheck,
  'My Templates': User,
  'Film': Film,
  'Music': Music,
  'Social': Flame,
  'Documentary': Camera,
  'Commercial': Tv,
  'Events': PartyPopper,
  'Educational': GraduationCap,
  'Stylized': Palette,
};

// Smart suggestion chips
const QUICK_RULES = [
  { label: 'Cut on beat', rule: '- Cut on every major beat of the music', category: 'timing' },
  { label: 'Slow motion 50%', rule: '- Apply 50% slow motion on emotional moments', category: 'speed' },
  { label: 'Jump cuts', rule: '- Use quick jump cuts (0.5s or less) for energy', category: 'timing' },
  { label: 'Flash on drop', rule: '- Flash to white on beat drops', category: 'effects' },
  { label: 'Zoom pulse 105%', rule: '- Add subtle zoom pulse on bass hits (105%)', category: 'motion' },
  { label: '2.39:1 letterbox', rule: '- Add cinematic letterboxing (2.39:1 aspect)', category: 'framing' },
  { label: 'Film grain 4%', rule: '- Apply subtle film grain (2-4%)', category: 'color' },
  { label: 'Vignette 15%', rule: '- Add edge vignette (15-20%)', category: 'color' },
  { label: 'Speed ramp', rule: '- Speed ramp from 200% to 50% on impacts', category: 'speed' },
  { label: 'Whip pan', rule: '- Use whip pan transitions between scenes', category: 'transitions' },
  { label: 'J-cut audio', rule: '- Use J-cuts (audio leads video by 0.5s)', category: 'audio' },
  { label: 'Match cut', rule: '- Use match cuts on similar shapes/movements', category: 'transitions' },
];

export default function CustomRulesEditorEnhanced({ value, onChange, disabled }: CustomRulesEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [quickIdea, setQuickIdea] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [addedRules, setAddedRules] = useState<string[]>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewTemplate, setPreviewTemplate] = useState<typeof VISION_TEMPLATES[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const isMobile = useIsMobile();
  
  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Custom templates state
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    label: '',
    description: '',
    icon: 'star',
    color: 'from-purple-500 to-pink-600',
    rules: ''
  });

  // Load favorites and custom templates from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      const savedCustomTemplates = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
      if (savedCustomTemplates) {
        setCustomTemplates(JSON.parse(savedCustomTemplates));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    saveFavorites(newFavorites);
    toast.success(favorites.includes(templateId) ? 'Removed from favorites' : 'Added to favorites');
  }, [favorites, saveFavorites]);

  // Save custom templates to localStorage
  const saveCustomTemplates = useCallback((templates: CustomTemplate[]) => {
    setCustomTemplates(templates);
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  }, []);

  // Create custom template
  const createCustomTemplate = useCallback(() => {
    if (!newTemplate.label.trim() || !newTemplate.rules.trim()) {
      toast.error('Please fill in name and instructions');
      return;
    }
    const template: CustomTemplate = {
      id: `custom_${Date.now()}`,
      icon: newTemplate.icon,
      label: newTemplate.label.trim(),
      category: 'My Templates',
      description: newTemplate.description.trim() || 'Custom template',
      color: newTemplate.color,
      rules: newTemplate.rules.trim(),
      isCustom: true,
      createdAt: Date.now()
    };
    saveCustomTemplates([...customTemplates, template]);
    setNewTemplate({ label: '', description: '', icon: 'star', color: 'from-purple-500 to-pink-600', rules: '' });
    setShowCreateDialog(false);
    toast.success('Template created successfully!');
  }, [newTemplate, customTemplates, saveCustomTemplates]);

  // Update custom template
  const updateCustomTemplate = useCallback(() => {
    if (!editingTemplate || !newTemplate.label.trim() || !newTemplate.rules.trim()) {
      toast.error('Please fill in name and instructions');
      return;
    }
    const updatedTemplates = customTemplates.map(t => 
      t.id === editingTemplate.id 
        ? { ...t, label: newTemplate.label.trim(), description: newTemplate.description.trim(), icon: newTemplate.icon, color: newTemplate.color, rules: newTemplate.rules.trim() }
        : t
    );
    saveCustomTemplates(updatedTemplates);
    setEditingTemplate(null);
    setNewTemplate({ label: '', description: '', icon: 'star', color: 'from-purple-500 to-pink-600', rules: '' });
    setShowCreateDialog(false);
    toast.success('Template updated successfully!');
  }, [editingTemplate, newTemplate, customTemplates, saveCustomTemplates]);

  // Delete custom template
  const deleteCustomTemplate = useCallback((templateId: string) => {
    const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
    saveCustomTemplates(updatedTemplates);
    if (favorites.includes(templateId)) {
      saveFavorites(favorites.filter(id => id !== templateId));
    }
    setPreviewTemplate(null);
    toast.success('Template deleted');
  }, [customTemplates, saveCustomTemplates, favorites, saveFavorites]);

  // Start editing a template
  const startEditTemplate = useCallback((template: CustomTemplate) => {
    setEditingTemplate(template);
    setNewTemplate({
      label: template.label,
      description: template.description,
      icon: template.icon,
      color: template.color,
      rules: template.rules
    });
    setShowCreateDialog(true);
  }, []);

  // Save current instructions as template
  const saveCurrentAsTemplate = useCallback(() => {
    if (!value.trim()) {
      toast.error('No instructions to save');
      return;
    }
    setNewTemplate(prev => ({ ...prev, rules: value }));
    setShowCreateDialog(true);
  }, [value]);

  // Get icon component for custom template
  const getCustomIcon = (iconId: string) => {
    return CUSTOM_ICON_OPTIONS.find(o => o.id === iconId)?.icon || Star;
  };

  // Combined templates (built-in + custom)
  const allTemplates = useMemo(() => {
    const builtIn = VISION_TEMPLATES.map(t => ({ ...t, isCustom: false as const }));
    const custom = customTemplates.map(t => ({ 
      ...t, 
      icon: getCustomIcon(t.icon)
    }));
    return [...builtIn, ...custom];
  }, [customTemplates]);

  const addQuickRule = (rule: string) => {
    if (addedRules.includes(rule)) return;
    const newValue = value.trim() ? value.trim() + '\n' + rule : rule;
    onChange(newValue);
    setAddedRules(prev => [...prev, rule]);
  };

  const applyTemplate = (template: typeof VISION_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    onChange(template.rules);
    setAddedRules([]);
    setTemplateDialogOpen(false);
    setPreviewTemplate(null);
    setSearchQuery('');
  };

  const filteredTemplates = useMemo(() => {
    let templates = allTemplates;
    
    // Filter by favorites
    if (activeCategory === 'Favorites') {
      templates = templates.filter(t => favorites.includes(t.id));
    }
    // Filter by custom templates
    else if (activeCategory === 'My Templates') {
      templates = templates.filter(t => 'isCustom' in t && t.isCustom);
    }
    // Filter by category
    else if (activeCategory !== 'All') {
      templates = templates.filter(t => t.category === activeCategory);
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(t => 
        t.label.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.rules.toLowerCase().includes(query)
      );
    }
    
    return templates;
  }, [activeCategory, searchQuery, allTemplates, favorites]);

  const handleQuickIdeaSubmit = useCallback(() => {
    if (!quickIdea.trim()) return;
    const formattedIdea = `- ${quickIdea.trim()}`;
    const newValue = value.trim() ? value.trim() + '\n' + formattedIdea : formattedIdea;
    onChange(newValue);
    setQuickIdea('');
  }, [quickIdea, value, onChange]);

  const lineCount = value.split('\n').filter(l => l.trim()).length;
  const charCount = value.length;

  // Template Browser Content - shared between Sheet and Drawer
  const TemplateBrowserContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search Bar */}
      <div className="p-3 sm:p-4 border-b border-border/30 bg-background/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 h-10 sm:h-11 bg-background border-border/50"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          </div>
          <Button
            onClick={() => {
              setEditingTemplate(null);
              setNewTemplate({ label: '', description: '', icon: 'star', color: 'from-purple-500 to-pink-600', rules: '' });
              setShowCreateDialog(true);
            }}
            className="h-10 sm:h-11 px-3 sm:px-4 bg-primary hover:bg-primary/90 gap-1.5"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Template</span>
          </Button>
        </div>
      </div>

      {/* Category Pills - Horizontal Scroll */}
      <div className="px-3 sm:px-4 py-2 border-b border-border/30 bg-muted/20">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-1">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] || Grid3X3;
              const count = cat === 'All' 
                ? allTemplates.length 
                : cat === 'Favorites' 
                  ? favorites.length
                  : cat === 'My Templates'
                    ? customTemplates.length
                    : VISION_TEMPLATES.filter(t => t.category === cat).length;
              return (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-9 px-3 sm:px-4 whitespace-nowrap gap-1.5 flex-shrink-0 transition-all',
                    activeCategory === cat 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-background hover:bg-muted',
                    cat === 'Favorites' && favorites.length > 0 && 'border-amber-500/50',
                    cat === 'My Templates' && customTemplates.length > 0 && 'border-primary/50'
                  )}
                  onClick={() => {
                    setActiveCategory(cat);
                    setPreviewTemplate(null);
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{cat}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className={cn(
                      "ml-1 h-5 px-1.5 text-[10px]",
                      activeCategory === cat ? "bg-background/20" : "bg-muted"
                    )}>
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* View Toggle (Desktop only) */}
      {!isMobile && (
        <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </span>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setViewMode('list')}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Templates Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Template Grid/List */}
        <ScrollArea className={cn(
          "flex-1",
          !isMobile && previewTemplate && "border-r border-border/30"
        )}>
          <div className={cn(
            "p-3 sm:p-4",
            isMobile || viewMode === 'grid' 
              ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3" 
              : "flex flex-col gap-2"
          )}>
            {filteredTemplates.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  {activeCategory === 'Favorites' ? (
                    <Bookmark className="w-8 h-8 text-muted-foreground/50" />
                  ) : activeCategory === 'My Templates' ? (
                    <FolderPlus className="w-8 h-8 text-muted-foreground/50" />
                  ) : (
                    <Search className="w-8 h-8 text-muted-foreground/50" />
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {activeCategory === 'Favorites' ? 'No favorites yet' : activeCategory === 'My Templates' ? 'No custom templates' : 'No templates found'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {activeCategory === 'Favorites' 
                    ? 'Bookmark templates for quick access' 
                    : activeCategory === 'My Templates'
                      ? 'Create your first custom template'
                      : 'Try a different search or category'}
                </p>
                {activeCategory === 'My Templates' ? (
                  <Button
                    size="sm"
                    className="mt-4 gap-1.5"
                    onClick={() => {
                      setEditingTemplate(null);
                      setNewTemplate({ label: '', description: '', icon: 'star', color: 'from-purple-500 to-pink-600', rules: '' });
                      setShowCreateDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Create Template
                  </Button>
                ) : activeCategory !== 'Favorites' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('All');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                const isPreviewing = previewTemplate?.id === template.id;
                const isFavorite = favorites.includes(template.id);
                const isCustom = 'isCustom' in template && template.isCustom;
                
                if (!isMobile && viewMode === 'list') {
                  // List view for desktop
                  return (
                    <button
                      key={template.id}
                      onClick={() => isMobile ? applyTemplate(template) : setPreviewTemplate(template)}
                      className={cn(
                        'relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group overflow-hidden w-full',
                        isPreviewing 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                          : isSelected
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br shadow-lg',
                        template.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground">{template.label}</p>
                          <Badge variant="outline" className="text-[10px]">{template.category}</Badge>
                          {isCustom && <Badge variant="secondary" className="text-[10px]">Custom</Badge>}
                          {isSelected && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 w-8 p-0 flex-shrink-0",
                          isFavorite ? "text-amber-500" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(template.id);
                        }}
                      >
                        {isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </Button>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  );
                }
                
                // Grid view / Mobile view
                return (
                  <button
                    key={template.id}
                    onClick={() => isMobile ? applyTemplate(template) : setPreviewTemplate(template)}
                    className={cn(
                      'relative p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 group overflow-hidden active:scale-[0.98]',
                      isPreviewing 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                        : isSelected
                          ? 'border-primary/50 bg-primary/5'
                          : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
                      template.color
                    )} />
                    <div className="relative space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br shadow-lg',
                          template.color
                        )}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-foreground truncate">{template.label}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-6 w-6 p-0 flex-shrink-0",
                                isFavorite ? "text-amber-500" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(template.id);
                              }}
                            >
                              {isFavorite ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1.5">{template.category}</Badge>
                            {isCustom && <Badge variant="secondary" className="text-[10px] px-1.5">Custom</Badge>}
                            {isSelected && (
                              <Badge variant="default" className="text-[10px] px-1.5 bg-primary">Active</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                      
                      {/* Mobile: Show Apply button inline */}
                      {isMobile && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Play className="w-3 h-3" /> Tap to apply
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Preview Panel - Desktop Only */}
        {!isMobile && previewTemplate && (
          <div className="w-80 lg:w-96 flex flex-col bg-muted/10">
            <div className="p-4 border-b border-border/30 bg-gradient-to-br from-muted/20 to-transparent">
              <div className="flex items-start gap-3 mb-3">
                <div className={cn(
                  'w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br shadow-lg',
                  previewTemplate.color
                )}>
                  <previewTemplate.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground">{previewTemplate.label}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px]">{previewTemplate.category}</Badge>
                    {'isCustom' in previewTemplate && previewTemplate.isCustom && (
                      <Badge variant="secondary" className="text-[10px]">Custom</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0",
                      favorites.includes(previewTemplate.id) ? "text-amber-500" : "text-muted-foreground"
                    )}
                    onClick={() => toggleFavorite(previewTemplate.id)}
                  >
                    {favorites.includes(previewTemplate.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setPreviewTemplate(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    AI Instructions
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-background border border-border/50 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap shadow-inner">
                  {previewTemplate.rules}
                </div>
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-border/30 bg-background/50 backdrop-blur-sm space-y-2">
              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold text-base shadow-lg shadow-primary/20"
                onClick={() => applyTemplate(previewTemplate)}
              >
                <Check className="w-5 h-5 mr-2" />
                Apply Template
              </Button>
              
              {'isCustom' in previewTemplate && previewTemplate.isCustom && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1 h-9"
                    onClick={() => {
                      const customT = customTemplates.find(t => t.id === previewTemplate.id);
                      if (customT) startEditTemplate(customT);
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteCustomTemplate(previewTemplate.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
              
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                This will replace your current instructions
              </p>
            </div>
          </div>
        )}

        {/* Empty preview state - Desktop only */}
        {!isMobile && !previewTemplate && (
          <div className="w-80 lg:w-96 flex items-center justify-center p-6 bg-muted/10">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Select a template</p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-[180px] mx-auto">
                Click any template to preview its AI instructions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Create/Edit Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary" />
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={newTemplate.label}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., My Cinematic Style"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this template does"
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNewTemplate(prev => ({ ...prev, icon: opt.id }))}
                      className={cn(
                        'w-10 h-10 rounded-lg border flex items-center justify-center transition-all',
                        newTemplate.icon === opt.id 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/30' 
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <IconComp className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {CUSTOM_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setNewTemplate(prev => ({ ...prev, color: opt.value }))}
                    className={cn(
                      'w-10 h-10 rounded-lg border transition-all bg-gradient-to-br',
                      opt.value,
                      newTemplate.color === opt.value 
                        ? 'ring-2 ring-primary ring-offset-2' 
                        : 'hover:scale-105'
                    )}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">AI Instructions</label>
              <Textarea
                value={newTemplate.rules}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, rules: e.target.value }))}
                placeholder="Enter your custom AI editing instructions..."
                rows={8}
                className="font-mono text-xs resize-none"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={editingTemplate ? updateCustomTemplate : createCustomTemplate}
              disabled={!newTemplate.label.trim() || !newTemplate.rules.trim()}
            >
              <Save className="w-4 h-4 mr-1" />
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="panel border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 shadow-lg shadow-primary/5">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="panel-header cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                <Wand2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">AI Edit Instructions</span>
                  <Badge variant="outline" className="text-[9px] border-primary/40 text-primary">
                    Controls Output
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Describe your vision — the AI will make it happen
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground font-mono">
                {lineCount} rules • {charCount} chars
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 space-y-5">
            {/* Quick Idea Input - Primary action */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={quickIdea}
                    onChange={(e) => setQuickIdea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickIdeaSubmit()}
                    placeholder="Type your idea... e.g., 'cut faster during chorus'"
                    className="h-11 pl-4 pr-10 text-sm bg-background border-border/50 focus:border-primary/50 focus:ring-primary/20"
                    disabled={disabled}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Zap className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                </div>
                <Button
                  onClick={handleQuickIdeaSubmit}
                  disabled={disabled || !quickIdea.trim()}
                  className="h-11 px-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
                Press Enter to add • Be specific about timing, percentages, and sections
              </p>
            </div>

            {/* Vision Templates - One-click powerful presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold">Vision Templates</span>
                  <Badge variant="secondary" className="text-[9px]">{VISION_TEMPLATES.length}</Badge>
                </div>
                {/* Use Drawer on mobile, Sheet on desktop */}
                {isMobile ? (
                  <Drawer open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2">
                        <Expand className="w-3 h-3" />
                        Browse All
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[90vh] max-h-[90vh]">
                      <DrawerHeader className="px-4 py-3 border-b border-border/30">
                        <div className="flex items-center justify-between">
                          <DrawerTitle className="flex items-center gap-2 text-base">
                            <Target className="w-5 h-5 text-primary" />
                            Vision Templates
                          </DrawerTitle>
                          <DrawerClose asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <X className="w-4 h-4" />
                            </Button>
                          </DrawerClose>
                        </div>
                      </DrawerHeader>
                      <TemplateBrowserContent />
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Sheet open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 px-2">
                      <Expand className="w-3 h-3" />
                      Browse All
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl p-0 flex flex-col">
                      <SheetHeader className="px-4 py-3 border-b border-border/30 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            Vision Templates
                            <Badge variant="outline" className="ml-2 text-xs">{VISION_TEMPLATES.length} Templates</Badge>
                          </SheetTitle>
                        </div>
                      </SheetHeader>
                      <TemplateBrowserContent />
                    </SheetContent>
                  </Sheet>
                )}
              </div>
              
              {/* Quick Template Grid - Show first 6 */}
              <div className="grid grid-cols-2 gap-2">
                {VISION_TEMPLATES.slice(0, 6).map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      disabled={disabled}
                      className={cn(
                        'relative p-3 rounded-lg border text-left transition-all duration-200 group overflow-hidden',
                        isSelected 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                          : 'border-border/50 hover:border-primary/40 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br',
                        template.color
                      )} />
                      <div className="relative">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm',
                            template.color
                          )}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{template.label}</p>
                            <p className="text-[9px] text-muted-foreground truncate">{template.category}</p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* More templates hint */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-[10px] text-muted-foreground hover:text-primary gap-1"
                onClick={() => setTemplateDialogOpen(true)}
              >
                <Plus className="w-3 h-3" />
                {VISION_TEMPLATES.length - 6} more templates available...
              </Button>
            </div>

            {/* Quick Add Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold">Quick Add</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[9px] gap-1 px-2"
                  onClick={() => setShowTips(!showTips)}
                >
                  <Lightbulb className="w-3 h-3" />
                  {showTips ? 'Hide Tips' : 'Pro Tips'}
                </Button>
              </div>
              <ScrollArea className="w-full">
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {QUICK_RULES.map((item) => {
                    const isAdded = addedRules.includes(item.rule);
                    return (
                      <Button
                        key={item.label}
                        variant="outline"
                        size="sm"
                        className={cn(
                          'h-7 text-[10px] px-2.5 transition-all',
                          isAdded 
                            ? 'bg-primary/10 border-primary/40 text-primary' 
                            : 'hover:bg-primary/10 hover:border-primary/50'
                        )}
                        onClick={() => addQuickRule(item.rule)}
                        disabled={disabled || isAdded}
                      >
                        {isAdded ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
                        )}
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Tips Panel */}
            {showTips && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-xs font-semibold">Pro Tips for Powerful Results</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" /> <strong>Timing:</strong> "cut every 2 beats" not "cut on beat"</p>
                    <p className="flex items-center gap-1"><Music className="w-3 h-3 text-primary" /> <strong>Sections:</strong> Reference verse, chorus, bridge, drop</p>
                    <p className="flex items-center gap-1"><Target className="w-3 h-3 text-primary" /> <strong>Percentages:</strong> "50% slow-mo" "105% zoom"</p>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1"><Camera className="w-3 h-3 text-primary" /> <strong>Shots:</strong> Specify which angles to prioritize</p>
                    <p className="flex items-center gap-1"><Palette className="w-3 h-3 text-primary" /> <strong>Color:</strong> "warm highlights, cool shadows"</p>
                    <p className="flex items-center gap-1"><Volume2 className="w-3 h-3 text-primary" /> <strong>Audio:</strong> "J-cut audio by 0.5s"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Editor */}
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-foreground font-semibold flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Your Instructions
                </span>
                <Badge 
                  variant="secondary" 
                  className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary border-0"
                >
                  <Wand2 className="w-2.5 h-2.5 mr-1" />
                  AI Reads This
                </Badge>
              </div>
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={10}
                placeholder="Enter your custom editing instructions here...

Examples:
- Cut on every major beat during the chorus
- Apply slow motion (50%) on emotional moments
- Use teal & orange color grading
- Add film grain for vintage feel
- Hold wide shots for 4+ seconds
- Quick cuts during verses (0.5s average)"
                className="font-mono text-xs leading-relaxed bg-background/80 border-border/50 resize-none focus:border-primary/50 focus:ring-primary/20"
                disabled={disabled}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 text-muted-foreground hover:text-destructive gap-1"
                onClick={() => {
                  onChange('');
                  setSelectedTemplate(null);
                  setAddedRules([]);
                }}
                disabled={disabled || !value}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset All
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] h-7 gap-1"
                onClick={saveCurrentAsTemplate}
                disabled={disabled || !value.trim()}
              >
                <Save className="w-3 h-3" />
                Save as Template
              </Button>
              
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-shrink-0">
                <Check className="w-3 h-3 text-success" />
                <span>Auto-saved</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
    </>
  );
}