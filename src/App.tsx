 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { AuthProvider } from "@/contexts/AuthContext";
 import ProtectedRoute from "@/components/ProtectedRoute";
 import AppLayout from "@/components/layout/AppLayout";
 import Index from "./pages/Index";
 import History from "./pages/History";
 import Auth from "./pages/Auth";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <AuthProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/auth" element={<Auth />} />
             <Route
               path="/"
               element={
                 <ProtectedRoute>
                   <AppLayout>
                     <Index />
                   </AppLayout>
                 </ProtectedRoute>
               }
             />
             <Route
               path="/history"
               element={
                 <ProtectedRoute>
                   <AppLayout>
                     <History />
                   </AppLayout>
                 </ProtectedRoute>
               }
             />
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
 export default App;
