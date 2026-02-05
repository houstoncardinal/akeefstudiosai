 import { Film, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
 
 export default function Header() {
   return (
    <header className="h-16 border-b border-border/30 bg-card/80 backdrop-blur-2xl sticky top-0 z-50">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.02]" />
      
      <div className="container mx-auto px-6 h-full flex items-center justify-between relative">
        {/* Logo & Brand */}
        <div className="flex items-center gap-4">
          {/* Animated logo */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-accent to-magenta blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-accent to-magenta flex items-center justify-center">
              <Film className="w-5.5 h-5.5 text-primary-foreground" />
             </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card animate-pulse" />
           </div>
          
           <div className="flex flex-col">
            <h1 className="font-cyber font-bold text-lg tracking-wide text-foreground flex items-center gap-2">
               Akeef Studio
              <span className="text-primary text-glow-cyan">AI</span>
             </h1>
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Professional Video Editor</span>
           </div>
         </div>
 
        {/* Center - Feature Badges */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="ai-badge">
            <Sparkles className="w-2.5 h-2.5" />
            OpenAI
          </div>
          <div className="ai-badge">
            <Zap className="w-2.5 h-2.5" />
            Gemini
          </div>
        </div>

        {/* Right - Status Panel */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5 text-xs">
            {/* AI Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
              <div className="relative">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <div className="absolute inset-0 animate-ping">
                  <Cpu className="w-3.5 h-3.5 text-primary opacity-50" />
                </div>
              </div>
              <span className="text-muted-foreground">AI Engine</span>
              <span className="text-primary font-medium">Ready</span>
             </div>
            
            {/* Activity indicator */}
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-success animate-pulse" />
              <span className="text-muted-foreground">v3.0</span>
            </div>
           </div>
          
          {/* Online status */}
           <div className="flex items-center gap-2">
            <div className="status-dot bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">Live</span>
           </div>
         </div>
       </div>
     </header>
   );
 }