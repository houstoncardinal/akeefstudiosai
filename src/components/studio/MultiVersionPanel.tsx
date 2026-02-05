 import { useState } from 'react';
 import { 
   Layers, 
   Film, 
   Smartphone, 
   Square, 
   RectangleHorizontal,
   Sparkles,
   Check,
   Clock,
   Download,
   Play
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Badge } from '@/components/ui/badge';
 import { Switch } from '@/components/ui/switch';
 import { cn } from '@/lib/utils';
 
 interface VersionPreset {
   id: string;
   name: string;
   description: string;
   aspectRatio: string;
   duration: string;
   icon: React.ReactNode;
   category: 'full' | 'commercial' | 'social' | 'promo';
 }
 
 const VERSION_PRESETS: VersionPreset[] = [
   {
     id: 'full_edit',
     name: 'Full Edit',
     description: 'Complete timeline with all sections',
     aspectRatio: '16:9',
     duration: 'Full length',
     icon: <Film className="w-4 h-4" />,
     category: 'full',
   },
   {
     id: 'commercial_60',
     name: '60s Commercial',
     description: 'Condensed story for broadcast',
     aspectRatio: '16:9',
     duration: '60 seconds',
     icon: <RectangleHorizontal className="w-4 h-4" />,
     category: 'commercial',
   },
   {
     id: 'commercial_30',
     name: '30s Commercial',
     description: 'Quick impact version',
     aspectRatio: '16:9',
     duration: '30 seconds',
     icon: <RectangleHorizontal className="w-4 h-4" />,
     category: 'commercial',
   },
   {
     id: 'commercial_15',
     name: '15s Cut',
     description: 'Ultra-short teaser',
     aspectRatio: '16:9',
     duration: '15 seconds',
     icon: <RectangleHorizontal className="w-4 h-4" />,
     category: 'commercial',
   },
   {
     id: 'tiktok_916',
     name: 'TikTok 9:16',
     description: 'Vertical format for TikTok/Reels',
     aspectRatio: '9:16',
     duration: '15-60s',
     icon: <Smartphone className="w-4 h-4" />,
     category: 'social',
   },
   {
     id: 'instagram_square',
     name: 'Instagram Square',
     description: 'Square format for feed posts',
     aspectRatio: '1:1',
     duration: '30-60s',
     icon: <Square className="w-4 h-4" />,
     category: 'social',
   },
   {
     id: 'trailer',
     name: 'Trailer',
     description: 'Cinematic preview with peaks',
     aspectRatio: '2.39:1',
     duration: '30-90s',
     icon: <Film className="w-4 h-4" />,
     category: 'promo',
   },
   {
     id: 'highlight_reel',
     name: 'Highlight Reel',
     description: 'Best moments compilation',
     aspectRatio: '16:9',
     duration: '60-120s',
     icon: <Sparkles className="w-4 h-4" />,
     category: 'promo',
   },
 ];
 
 interface MultiVersionPanelProps {
   selectedVersions: string[];
   onVersionsChange: (versions: string[]) => void;
   isProcessing?: boolean;
   generatedVersions?: string[];
 }
 
 const categoryLabels: Record<string, string> = {
   full: 'Master',
   commercial: 'Commercial',
   social: 'Social',
   promo: 'Promo',
 };
 
 export default function MultiVersionPanel({ 
   selectedVersions, 
   onVersionsChange,
   isProcessing = false,
   generatedVersions = []
 }: MultiVersionPanelProps) {
   const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
 
   const toggleVersion = (versionId: string) => {
     if (selectedVersions.includes(versionId)) {
       onVersionsChange(selectedVersions.filter(v => v !== versionId));
     } else {
       onVersionsChange([...selectedVersions, versionId]);
     }
   };
 
   const selectAll = () => {
     onVersionsChange(VERSION_PRESETS.map(v => v.id));
   };
 
   const selectNone = () => {
     onVersionsChange(['full_edit']); // Always keep at least the full edit
   };
 
   const groupedVersions = VERSION_PRESETS.reduce((acc, version) => {
     if (!acc[version.category]) acc[version.category] = [];
     acc[version.category].push(version);
     return acc;
   }, {} as Record<string, VersionPreset[]>);
 
   return (
     <div className="panel h-full">
       <div className="panel-header">
         <div className="flex items-center gap-2">
           <Layers className="w-3.5 h-3.5 text-primary" />
           <span className="panel-title">Multi-Version Generator</span>
           <Badge variant="outline" className="ml-1 text-[9px]">
             {selectedVersions.length} selected
           </Badge>
         </div>
         <div className="flex items-center gap-1">
           <Button variant="ghost" size="sm" onClick={selectAll} className="h-6 text-[9px] px-2">
             All
           </Button>
           <Button variant="ghost" size="sm" onClick={selectNone} className="h-6 text-[9px] px-2">
             Reset
           </Button>
         </div>
       </div>
 
       <ScrollArea className="h-[320px]">
         <div className="p-3 space-y-4">
           {/* Quick Stats */}
           <div className="grid grid-cols-3 gap-2">
             <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
               <p className="text-lg font-bold text-primary">{selectedVersions.length}</p>
               <p className="text-[9px] text-muted-foreground">Versions</p>
             </div>
             <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
               <p className="text-lg font-bold text-foreground">
                 {new Set(selectedVersions.map(v => VERSION_PRESETS.find(p => p.id === v)?.aspectRatio)).size}
               </p>
               <p className="text-[9px] text-muted-foreground">Formats</p>
             </div>
             <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
               <p className="text-lg font-bold text-success">{generatedVersions.length}</p>
               <p className="text-[9px] text-muted-foreground">Ready</p>
             </div>
           </div>
 
           {/* Version Categories */}
           {Object.entries(groupedVersions).map(([category, versions]) => (
             <div key={category} className="space-y-2">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                   {categoryLabels[category]}
                 </span>
                 <span className="text-[9px] text-muted-foreground">
                   {versions.filter(v => selectedVersions.includes(v.id)).length}/{versions.length}
                 </span>
               </div>
 
               <div className="space-y-1.5">
                 {versions.map((version) => {
                   const isSelected = selectedVersions.includes(version.id);
                   const isGenerated = generatedVersions.includes(version.id);
 
                   return (
                     <div
                       key={version.id}
                       className={cn(
                         "p-3 rounded-lg border transition-all cursor-pointer group",
                         isSelected 
                           ? "bg-primary/5 border-primary/30 shadow-sm" 
                           : "bg-card/50 border-border/30 hover:border-border/60"
                       )}
                       onClick={() => toggleVersion(version.id)}
                     >
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                           isSelected ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                         )}>
                           {version.icon}
                         </div>
 
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-medium">{version.name}</span>
                             {isGenerated && (
                               <Badge variant="outline" className="text-[8px] px-1 py-0 bg-success/10 text-success border-success/20">
                                 <Check className="w-2.5 h-2.5 mr-0.5" />
                                 Ready
                               </Badge>
                             )}
                           </div>
                           <p className="text-[10px] text-muted-foreground truncate">
                             {version.aspectRatio} • {version.duration}
                           </p>
                         </div>
 
                         <Switch 
                           checked={isSelected}
                           onCheckedChange={() => toggleVersion(version.id)}
                           className="data-[state=checked]:bg-primary"
                         />
                       </div>
 
                       {/* Actions for generated versions */}
                       {isGenerated && (
                         <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                           <Button variant="ghost" size="sm" className="h-6 text-[9px] gap-1 flex-1">
                             <Play className="w-3 h-3" />
                             Preview
                           </Button>
                           <Button variant="ghost" size="sm" className="h-6 text-[9px] gap-1 flex-1">
                             <Download className="w-3 h-3" />
                             Export
                           </Button>
                         </div>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>
           ))}
 
           {/* Generation Info */}
           <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
             <div className="flex items-start gap-2">
               <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
               <div>
                 <p className="text-[10px] font-medium text-foreground">Estimated Time</p>
                 <p className="text-[9px] text-muted-foreground">
                   ~{Math.max(1, selectedVersions.length * 0.5).toFixed(1)} minutes for {selectedVersions.length} version(s)
                 </p>
               </div>
             </div>
           </div>
         </div>
       </ScrollArea>
     </div>
   );
 }