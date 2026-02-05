 import { Film, Sparkles, Cpu } from 'lucide-react';
 
 export default function Header() {
   return (
     <header className="h-14 border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
       <div className="container mx-auto px-4 h-full flex items-center justify-between">
         {/* Logo */}
         <div className="flex items-center gap-3">
           <div className="relative">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-magenta flex items-center justify-center glow-cyan-sm">
               <Film className="w-5 h-5 text-primary-foreground" />
             </div>
             <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-background" />
           </div>
           <div className="flex flex-col">
             <h1 className="font-display font-bold text-base tracking-tight text-foreground flex items-center gap-2">
               Akeef Studio
               <span className="text-primary">AI</span>
               <Sparkles className="w-4 h-4 text-accent" />
             </h1>
             <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Professional Video Editor</span>
           </div>
         </div>
 
         {/* Status */}
         <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
             <div className="flex items-center gap-1.5">
               <Cpu className="w-3.5 h-3.5 text-primary" />
               <span>AI Engine Ready</span>
             </div>
             <div className="h-3 w-px bg-border" />
             <span>v3.0 Studio</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-xs text-success">Online</span>
           </div>
         </div>
       </div>
     </header>
   );
 }