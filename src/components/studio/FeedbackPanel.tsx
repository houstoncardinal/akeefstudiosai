 import { useState } from 'react';
 import { 
   MessageSquare, 
   AlertTriangle, 
   Lightbulb, 
   Clock, 
   Zap, 
   Palette, 
   ArrowRightLeft,
   Music,
   Camera,
   RefreshCw,
   Star,
   ChevronRight
 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Badge } from '@/components/ui/badge';
 import { cn } from '@/lib/utils';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 
 interface FeedbackItem {
   type: 'pacing' | 'energy' | 'composition' | 'audio' | 'color' | 'transitions';
   severity: 'suggestion' | 'warning' | 'critical';
   timestamp?: string;
   message: string;
   action?: string;
 }
 
 interface FeedbackPanelProps {
   config: {
     style: string;
     colorGrade: string;
     effectPreset: string;
     versions: string[];
     beatRules: string[];
     directorIntent: string | null;
   };
   timelineData?: {
     duration?: number;
     bpm?: number;
     sections?: string[];
   };
   showAfterProcessing: boolean;
 }
 
 const typeIcons: Record<string, React.ReactNode> = {
   pacing: <Clock className="w-3.5 h-3.5" />,
   energy: <Zap className="w-3.5 h-3.5" />,
   composition: <Camera className="w-3.5 h-3.5" />,
   audio: <Music className="w-3.5 h-3.5" />,
   color: <Palette className="w-3.5 h-3.5" />,
   transitions: <ArrowRightLeft className="w-3.5 h-3.5" />,
 };
 
 const severityColors: Record<string, string> = {
   suggestion: 'bg-primary/10 text-primary border-primary/20',
   warning: 'bg-warning/10 text-warning border-warning/20',
   critical: 'bg-destructive/10 text-destructive border-destructive/20',
 };
 
 export default function FeedbackPanel({ config, timelineData, showAfterProcessing }: FeedbackPanelProps) {
   const { toast } = useToast();
   const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
   const [overallScore, setOverallScore] = useState<number | null>(null);
   const [summary, setSummary] = useState<string | null>(null);
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [hasAnalyzed, setHasAnalyzed] = useState(false);
 
   const analyzeFeedback = async () => {
     setIsAnalyzing(true);
     try {
       const { data, error } = await supabase.functions.invoke('analyze-edit', {
         body: { 
           editConfig: config, 
           timelineData,
           processingResult: { completed: showAfterProcessing }
         }
       });
 
       if (error) throw error;
       
       if (data.error) {
         toast({
           variant: 'destructive',
           title: 'Analysis Failed',
           description: data.error,
         });
         return;
       }
 
       setFeedback(data.feedback || []);
       setOverallScore(data.overallScore);
       setSummary(data.summary);
       setHasAnalyzed(true);
       
       toast({
         title: 'Analysis Complete',
         description: `Found ${data.feedback?.length || 0} suggestions for your edit.`,
       });
     } catch (err) {
       console.error('Feedback analysis error:', err);
       toast({
         variant: 'destructive',
         title: 'Analysis Error',
         description: err instanceof Error ? err.message : 'Failed to analyze edit',
       });
     } finally {
       setIsAnalyzing(false);
     }
   };
 
   if (!showAfterProcessing && !hasAnalyzed) {
     return (
       <div className="panel h-full">
         <div className="panel-header">
           <div className="flex items-center gap-2">
             <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
             <span className="panel-title">AI Feedback</span>
           </div>
         </div>
         <div className="p-6 flex flex-col items-center justify-center h-48 text-center">
           <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center mb-4">
             <Lightbulb className="w-6 h-6 text-muted-foreground" />
           </div>
           <p className="text-sm font-medium text-muted-foreground">No feedback yet</p>
           <p className="text-[10px] text-muted-foreground/60 mt-1">Complete processing to get AI suggestions</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="panel h-full">
       <div className="panel-header">
         <div className="flex items-center gap-2">
           <MessageSquare className="w-3.5 h-3.5 text-primary" />
           <span className="panel-title">AI Feedback</span>
           {overallScore && (
             <Badge variant="outline" className="ml-2 gap-1 text-[10px]">
               <Star className="w-3 h-3 text-warning fill-warning" />
               {overallScore}/10
             </Badge>
           )}
         </div>
         <Button 
           variant="ghost" 
           size="sm" 
           onClick={analyzeFeedback}
           disabled={isAnalyzing}
           className="h-7 text-[10px] gap-1.5"
         >
           <RefreshCw className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
           {isAnalyzing ? 'Analyzing...' : hasAnalyzed ? 'Refresh' : 'Analyze'}
         </Button>
       </div>
 
       <ScrollArea className="h-[280px]">
         <div className="p-3 space-y-3">
           {/* Summary */}
           {summary && (
             <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
               <p className="text-xs text-foreground/80">{summary}</p>
             </div>
           )}
 
           {/* Feedback Items */}
           {feedback.length > 0 ? (
             <div className="space-y-2">
               {feedback.map((item, index) => (
                 <div 
                   key={index}
                   className={cn(
                     "p-3 rounded-lg border transition-all hover:shadow-sm",
                     severityColors[item.severity]
                   )}
                 >
                   <div className="flex items-start gap-2">
                     <div className="mt-0.5">
                       {item.severity === 'critical' ? (
                         <AlertTriangle className="w-3.5 h-3.5" />
                       ) : item.severity === 'warning' ? (
                         <AlertTriangle className="w-3.5 h-3.5" />
                       ) : (
                         <Lightbulb className="w-3.5 h-3.5" />
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                           {typeIcons[item.type]}
                           {item.type}
                         </Badge>
                         {item.timestamp && (
                           <span className="text-[10px] font-mono opacity-70">
                             @ {item.timestamp}
                           </span>
                         )}
                       </div>
                       <p className="text-xs font-medium">{item.message}</p>
                       {item.action && (
                         <div className="flex items-center gap-1 mt-1.5 text-[10px] opacity-70">
                           <ChevronRight className="w-3 h-3" />
                           {item.action}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           ) : !isAnalyzing && !hasAnalyzed ? (
             <div className="flex flex-col items-center justify-center py-8 text-center">
               <Button onClick={analyzeFeedback} className="gap-2">
                 <Zap className="w-4 h-4" />
                 Get AI Feedback
               </Button>
               <p className="text-[10px] text-muted-foreground mt-3">
                 AI will analyze your edit configuration
               </p>
             </div>
           ) : null}
 
           {isAnalyzing && (
             <div className="flex flex-col items-center justify-center py-8">
               <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
               <p className="text-xs text-muted-foreground">Analyzing your edit...</p>
             </div>
           )}
         </div>
       </ScrollArea>
     </div>
   );
 }