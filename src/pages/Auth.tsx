 import { useState } from 'react';
 import { Navigate } from 'react-router-dom';
 import { useAuth } from '@/contexts/AuthContext';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useToast } from '@/hooks/use-toast';
 import { Loader2, Film, Sparkles } from 'lucide-react';
 
 export default function Auth() {
   const { user, loading, signIn, signUp } = useAuth();
   const { toast } = useToast();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (user) {
     return <Navigate to="/" replace />;
   }
 
   const handleSignIn = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     const { error } = await signIn(email, password);
     setIsSubmitting(false);
     if (error) {
       toast({
         variant: 'destructive',
         title: 'Sign in failed',
         description: error.message,
       });
     }
   };
 
   const handleSignUp = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsSubmitting(true);
     const { error } = await signUp(email, password);
     setIsSubmitting(false);
     if (error) {
       toast({
         variant: 'destructive',
         title: 'Sign up failed',
         description: error.message,
       });
     } else {
       toast({
         title: 'Check your email',
         description: 'We sent you a verification link to confirm your account.',
       });
     }
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center bg-background p-4">
       <div className="w-full max-w-md animate-fade-in">
         {/* Logo and title */}
         <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
             <Film className="w-8 h-8 text-primary" />
           </div>
           <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
             FCPXML AI Rough Cut
             <Sparkles className="w-5 h-5 text-primary" />
           </h1>
           <p className="text-muted-foreground mt-2">
             AI-powered video editing for Final Cut Pro
           </p>
         </div>
 
         <Card className="glass-card">
           <CardHeader className="pb-4">
             <CardTitle className="text-lg">Welcome</CardTitle>
             <CardDescription>
               Sign in to your account or create a new one
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Tabs defaultValue="signin" className="w-full">
               <TabsList className="grid w-full grid-cols-2 mb-6">
                 <TabsTrigger value="signin">Sign In</TabsTrigger>
                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
               </TabsList>
 
               <TabsContent value="signin">
                 <form onSubmit={handleSignIn} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signin-email">Email</Label>
                     <Input
                       id="signin-email"
                       type="email"
                       placeholder="you@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       disabled={isSubmitting}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signin-password">Password</Label>
                     <Input
                       id="signin-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       disabled={isSubmitting}
                     />
                   </div>
                   <Button type="submit" className="w-full glow-primary-hover" disabled={isSubmitting}>
                     {isSubmitting ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Signing in...
                       </>
                     ) : (
                       'Sign In'
                     )}
                   </Button>
                 </form>
               </TabsContent>
 
               <TabsContent value="signup">
                 <form onSubmit={handleSignUp} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-email">Email</Label>
                     <Input
                       id="signup-email"
                       type="email"
                       placeholder="you@example.com"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       disabled={isSubmitting}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signup-password">Password</Label>
                     <Input
                       id="signup-password"
                       type="password"
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       minLength={6}
                       disabled={isSubmitting}
                     />
                   </div>
                   <Button type="submit" className="w-full glow-primary-hover" disabled={isSubmitting}>
                     {isSubmitting ? (
                       <>
                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         Creating account...
                       </>
                     ) : (
                       'Create Account'
                     )}
                   </Button>
                 </form>
               </TabsContent>
             </Tabs>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }