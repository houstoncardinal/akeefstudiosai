import { CINEMATIC_LUTS, type CinematicLUT } from '@/lib/presets';
import { cn } from '@/lib/utils';
import { CheckCircle, Film, Sparkles, Camera, Tv, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import LUT thumbnails
import tealOrangeThumb from '@/assets/luts/teal-orange.jpg';
import vintageFilmThumb from '@/assets/luts/vintage-film.jpg';
import moodyDesatThumb from '@/assets/luts/moody-desat.jpg';
import vibrantPopThumb from '@/assets/luts/vibrant-pop.jpg';
import neonNightsThumb from '@/assets/luts/neon-nights.jpg';
import cleanNaturalThumb from '@/assets/luts/clean-natural.jpg';
import blockbusterThumb from '@/assets/luts/blockbuster.jpg';
import kodakGoldThumb from '@/assets/luts/kodak-gold.jpg';
import fujiVelviaThumb from '@/assets/luts/fuji-velvia.jpg';
import thrillerColdThumb from '@/assets/luts/thriller-cold.jpg';
import scifiGreenThumb from '@/assets/luts/scifi-green.jpg';
import goldenHourThumb from '@/assets/luts/golden-hour.jpg';
import bwClassicThumb from '@/assets/luts/bw-classic.jpg';
import romanceSoftThumb from '@/assets/luts/romance-soft.jpg';

interface ColorPanelProps {
  colorGrade: string;
  onColorGradeChange: (colorGrade: string) => void;
  disabled?: boolean;
}

const thumbnailMap: Record<string, string> = {
  'teal-orange': tealOrangeThumb,
  'vintage-film': vintageFilmThumb,
  'moody-desat': moodyDesatThumb,
  'vibrant-pop': vibrantPopThumb,
  'neon-nights': neonNightsThumb,
  'clean-natural': cleanNaturalThumb,
  'blockbuster': blockbusterThumb,
  'kodak-gold': kodakGoldThumb,
  'fuji-velvia': fujiVelviaThumb,
  'thriller-cold': thrillerColdThumb,
  'scifi-green': scifiGreenThumb,
  'golden-hour': goldenHourThumb,
  'bw-classic': bwClassicThumb,
  'romance-soft': romanceSoftThumb,
};

const categoryIcons = {
  hollywood: Film,
  film_stock: Camera,
  stylized: Sparkles,
  broadcast: Tv,
  music_video: Music,
};

const categoryLabels = {
  hollywood: 'Hollywood',
  film_stock: 'Film Stock',
  stylized: 'Stylized',
  broadcast: 'Broadcast',
  music_video: 'Music Video',
};

export default function ColorPanel({ colorGrade, onColorGradeChange, disabled }: ColorPanelProps) {
  const selectedLUT = CINEMATIC_LUTS.find(l => l.id === colorGrade);
  
  const categories = ['hollywood', 'film_stock', 'stylized', 'music_video', 'broadcast'] as const;

  const renderLUTCard = (lut: CinematicLUT) => {
    const active = colorGrade === lut.id;
    const thumbnail = thumbnailMap[lut.thumbnail];
    
    return (
      <button
        key={lut.id}
        onClick={() => !disabled && onColorGradeChange(lut.id)}
        disabled={disabled}
        className={cn(
          'group relative rounded-xl overflow-hidden border-2 transition-all duration-200',
          active 
            ? 'border-primary ring-2 ring-primary/30 scale-[1.02]' 
            : 'border-transparent hover:border-primary/40 hover:scale-[1.01]'
        )}
      >
        {/* Thumbnail */}
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={thumbnail} 
            alt={lut.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Active indicator */}
          {active && (
            <div className="absolute top-2 right-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          )}
          
          {/* LUT name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <p className={cn(
              'text-xs font-bold text-white',
              active && 'text-primary-foreground'
            )}>
              {lut.name}
            </p>
            <p className="text-[9px] text-white/70 line-clamp-1 mt-0.5">
              {lut.description}
            </p>
          </div>
        </div>
        
        {/* Tags */}
        <div className="p-2 bg-card flex flex-wrap gap-1">
          {lut.tags.slice(0, 3).map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-[8px] px-1.5 py-0 h-4 bg-muted/50"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* LUT Library */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary" />
            <span className="panel-title">Cinematic LUT Library</span>
          </div>
          <Badge variant="outline" className="text-[9px]">
            {CINEMATIC_LUTS.length} Professional LUTs
          </Badge>
        </div>
        
        <Tabs defaultValue="hollywood" className="w-full">
          <div className="px-3 pt-3">
            <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/30 p-1">
              {categories.map(cat => {
                const Icon = categoryIcons[cat];
                const count = CINEMATIC_LUTS.filter(l => l.category === cat).length;
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="flex-1 min-w-[80px] gap-1 text-[10px] px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{categoryLabels[cat]}</span>
                    <span className="text-[8px] opacity-70">({count})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          
          <ScrollArea className="h-[320px]">
            {categories.map(cat => (
              <TabsContent key={cat} value={cat} className="m-0 p-3">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {CINEMATIC_LUTS.filter(l => l.category === cat).map(renderLUTCard)}
                </div>
              </TabsContent>
            ))}
          </ScrollArea>
        </Tabs>
      </div>

      {/* Selected LUT Settings */}
      {selectedLUT && (
        <div className="panel">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="panel-title">LUT Parameters</span>
            </div>
            <span className="text-[9px] text-muted-foreground font-mono">{selectedLUT.lut}</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Main color wheels */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Lift', value: selectedLUT.settings.lift },
                { label: 'Gamma', value: selectedLUT.settings.gamma },
                { label: 'Gain', value: selectedLUT.settings.gain },
              ].map((wheel) => (
                <div key={wheel.label} className="text-center p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center mb-1">
                    <span className="text-[10px] font-mono font-bold">
                      {wheel.value > 0 ? `+${wheel.value}` : wheel.value}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{wheel.label}</span>
                </div>
              ))}
            </div>
            
            {/* Sliders */}
            {[
              { label: 'Contrast', value: selectedLUT.settings.contrast, range: [0.5, 2] },
              { label: 'Saturation', value: selectedLUT.settings.saturation, range: [0, 2] },
              { label: 'Temperature', value: selectedLUT.settings.temperature, range: [-50, 50] },
              { label: 'Shadows', value: selectedLUT.settings.shadows, range: [-50, 50] },
              { label: 'Highlights', value: selectedLUT.settings.highlights, range: [-50, 50] },
            ].map((setting) => (
              <div key={setting.label} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{setting.label}</span>
                  <span className="text-[10px] font-mono font-semibold text-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                    {setting.value > 0 ? `+${setting.value}` : setting.value}
                  </span>
                </div>
                <Slider
                  value={[setting.value]}
                  min={setting.range[0]}
                  max={setting.range[1]}
                  step={0.1}
                  disabled
                  className="opacity-70"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}