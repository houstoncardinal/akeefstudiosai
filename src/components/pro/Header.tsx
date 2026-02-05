 import { Film, Sparkles, Github, Twitter } from 'lucide-react';
 
 export default function Header() {
   return (
     <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
       <div className="container mx-auto px-4 h-14 flex items-center justify-between">
         {/* Logo */}
         <div className="flex items-center gap-3">
           <div className="relative">
             <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center glow-cyan-sm">
               <Film className="w-5 h-5 text-primary-foreground" />
             </div>
             <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
           </div>
           <div className="flex flex-col">
             <h1 className="font-display font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
               FCPXML AI
               <Sparkles className="w-3.5 h-3.5 text-primary" />
             </h1>
             <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Rough Cut Engine</span>
           </div>
         </div>
 
         {/* Status indicator */}
         <div className="hidden sm:flex items-center gap-6">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-xs text-muted-foreground">AI Online</span>
           </div>
           <div className="h-4 w-px bg-border" />
           <span className="text-xs text-muted-foreground">v2.0 Pro</span>
         </div>
 
         {/* Actions */}
         <div className="flex items-center gap-2">
           <a 
             href="#" 
             className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
             title="Documentation"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
           </a>
         </div>
       </div>
     </header>
   );
 }