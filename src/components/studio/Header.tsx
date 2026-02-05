import { Film, Sparkles, Cpu, Zap, Activity, Crown } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Badge } from '@/components/ui/badge';
 
 export default function Header() {
   return (
    <header className="h-16 border-b border-border/50 bg-card/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5 text-primary-foreground" />
             </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
           </div>
          
          <div className="flex flex-col">
            <h1 className="font-display font-bold text-lg tracking-tight text-foreground flex items-center gap-2">
              Akeef Studio
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 text-[10px] px-1.5 py-0">
                AI
              </Badge>
            </h1>
            <span className="text-[10px] text-muted-foreground tracking-wide">Professional Video Editor</span>
          </div>
        </div>
 
        {/* Center - Feature Badges */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="ai-badge">
            <Sparkles className="w-3 h-3" />
            OpenAI GPT-5
          </div>
          <div className="ai-badge">
            <Zap className="w-3 h-3" />
            Gemini Pro
          </div>
          <Badge variant="outline" className="gap-1.5 text-[10px] border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Crown className="w-3 h-3" />
            World-Class AI
          </Badge>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">AI Engine</span>
              <span className="text-success font-semibold">Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-success" />
              <span className="text-muted-foreground font-medium">v4.0</span>
            </div>
           </div>
          
          <ThemeToggle />
          
          <div className="flex items-center gap-2">
            <div className="status-dot bg-success" />
            <span className="text-xs font-medium text-success">Live</span>
          </div>
         </div>
       </div>
     </header>
   );
 }