 import { ReactNode } from 'react';
 import { Link, useLocation } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Film, Home, History, LogOut, Sparkles } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface AppLayoutProps {
   children: ReactNode;
 }
 
 export default function AppLayout({ children }: AppLayoutProps) {
   const { user, signOut } = useAuth();
   const location = useLocation();
 
   const navItems = [
     { href: '/', label: 'Dashboard', icon: Home },
     { href: '/history', label: 'History', icon: History },
   ];
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
           {/* Logo */}
           <Link to="/" className="flex items-center gap-3 group">
             <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
               <Film className="w-5 h-5 text-primary" />
             </div>
             <span className="font-semibold text-foreground hidden sm:inline-flex items-center gap-1.5">
               FCPXML AI
               <Sparkles className="w-4 h-4 text-primary" />
             </span>
           </Link>
 
           {/* Navigation */}
           <nav className="flex items-center gap-1">
             {navItems.map((item) => {
               const isActive = location.pathname === item.href;
               return (
                 <Link key={item.href} to={item.href}>
                   <Button
                     variant={isActive ? 'secondary' : 'ghost'}
                     size="sm"
                     className={cn(
                       'gap-2',
                       isActive && 'bg-secondary text-secondary-foreground'
                     )}
                   >
                     <item.icon className="w-4 h-4" />
                     <span className="hidden sm:inline">{item.label}</span>
                   </Button>
                 </Link>
               );
             })}
           </nav>
 
           {/* User info & logout */}
           <div className="flex items-center gap-3">
             <span className="text-sm text-muted-foreground hidden md:inline truncate max-w-[200px]">
               {user?.email}
             </span>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => signOut()}
               className="gap-2"
             >
               <LogOut className="w-4 h-4" />
               <span className="hidden sm:inline">Sign Out</span>
             </Button>
           </div>
         </div>
       </header>
 
       {/* Main content */}
       <main className="container mx-auto px-4 py-8">
         {children}
       </main>
     </div>
   );
 }