import { Sparkles, Cpu, Zap, Activity, Crown, Hexagon } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { Badge } from '@/components/ui/badge';
 
 export default function Header() {
   return (
    <header className="h-14 border-b border-border/40 bg-card/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
              <Hexagon className="w-5 h-5 text-background" strokeWidth={2.5} />
             </div>
           </div>
          
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              Akeef Studio's
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-primary/30 text-primary">
                PRO
              </Badge>
            </h1>
            <span className="text-[9px] text-muted-foreground tracking-wide">Enterprise Video Platform</span>
          </div>
        </div>
 
        {/* Center - Feature Badges */}
        <div className="hidden lg:flex items-center gap-1.5">
          <div className="ai-badge">
            <Sparkles className="w-3 h-3" />
            GPT-5
          </div>
          <div className="ai-badge">
            <Zap className="w-3 h-3" />
            Gemini
          </div>
          <Badge variant="outline" className="gap-1 text-[9px] border-warning/30 text-warning">
            <Crown className="w-3 h-3" />
            Enterprise
          </Badge>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/40">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span className="text-success font-medium">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-success" />
              <span className="text-muted-foreground text-[10px]">v4.2</span>
            </div>
           </div>
          
          <ThemeSelector />
          
          <div className="flex items-center gap-1.5">
            <div className="status-dot bg-success" />
            <span className="text-[10px] font-medium text-success">Live</span>
          </div>
         </div>
       </div>
     </header>
   );
 }