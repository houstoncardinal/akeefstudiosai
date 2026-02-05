 import { useState, useEffect } from 'react';
 import { useAuth } from '@/contexts/AuthContext';
 import { supabase } from '@/integrations/supabase/client';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { useToast } from '@/hooks/use-toast';
 import { Download, Eye, FileVideo, Clock, Loader2, History as HistoryIcon } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface Job {
   id: string;
   input_filename: string;
   output_filename: string | null;
   output_file_path: string | null;
   preset: string;
   model: string;
   style_rules: string | null;
   status: string;
   error_message: string | null;
   created_at: string;
   completed_at: string | null;
 }
 
 export default function History() {
   const { user } = useAuth();
   const { toast } = useToast();
   const [jobs, setJobs] = useState<Job[]>([]);
   const [loading, setLoading] = useState(true);
   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
 
   useEffect(() => {
     if (user) {
       fetchJobs();
     }
   }, [user]);
 
   const fetchJobs = async () => {
     try {
       const { data, error } = await supabase
         .from('jobs')
         .select('*')
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setJobs(data || []);
     } catch (err) {
       console.error('Failed to fetch jobs:', err);
       toast({
         variant: 'destructive',
         title: 'Failed to load history',
         description: err instanceof Error ? err.message : 'Unknown error',
       });
     } finally {
       setLoading(false);
     }
   };
 
   const handleDownload = async (job: Job) => {
     if (!job.output_file_path) return;
 
     try {
       const { data, error } = await supabase.storage
         .from('fcpxml-files')
         .download(job.output_file_path);
 
       if (error) throw error;
 
       const url = URL.createObjectURL(data);
       const a = document.createElement('a');
       a.href = url;
       a.download = job.output_filename || 'output.fcpxml';
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
 
       toast({ title: 'Download started' });
     } catch (err) {
       toast({
         variant: 'destructive',
         title: 'Download failed',
         description: err instanceof Error ? err.message : 'Unknown error',
       });
     }
   };
 
   const formatPreset = (preset: string) => {
     return preset.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
   };
 
   const formatDate = (date: string) => {
     return new Date(date).toLocaleDateString('en-US', {
       month: 'short',
       day: 'numeric',
       hour: '2-digit',
       minute: '2-digit',
     });
   };
 
   const getStatusBadge = (status: string) => {
     const statusClasses: Record<string, string> = {
       pending: 'status-pending',
       processing: 'status-processing',
       completed: 'status-completed',
       failed: 'status-failed',
     };
 
     return (
       <Badge variant="outline" className={cn('text-xs', statusClasses[status] || '')}>
         {status.charAt(0).toUpperCase() + status.slice(1)}
       </Badge>
     );
   };
 
   if (loading) {
     return (
       <div className="flex items-center justify-center h-64">
         <Loader2 className="w-8 h-8 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
       {/* Header */}
       <div>
         <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
           Job History
           <HistoryIcon className="w-7 h-7 text-primary" />
         </h1>
         <p className="text-muted-foreground mt-2">
           View and download your past AI rough cut generations
         </p>
       </div>
 
       {jobs.length === 0 ? (
         <Card className="glass-card">
           <CardContent className="flex flex-col items-center justify-center py-16">
             <FileVideo className="w-16 h-16 text-muted-foreground mb-4" />
             <h3 className="text-lg font-medium text-foreground mb-2">No jobs yet</h3>
             <p className="text-muted-foreground text-center">
               Your processing history will appear here once you generate your first rough cut.
             </p>
           </CardContent>
         </Card>
       ) : (
         <Card className="glass-card">
           <CardHeader>
             <CardTitle className="text-lg">Recent Jobs</CardTitle>
             <CardDescription>
               {jobs.length} job{jobs.length !== 1 ? 's' : ''} in history
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-3">
               {jobs.map((job) => (
                 <div
                   key={job.id}
                   className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                 >
                   <div className="flex items-center gap-4 flex-1 min-w-0">
                     <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                       <FileVideo className="w-5 h-5 text-primary" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-medium text-foreground truncate">
                         {job.input_filename}
                       </p>
                       <div className="flex items-center gap-3 text-sm text-muted-foreground">
                         <span>{formatPreset(job.preset)}</span>
                         <span className="text-border">•</span>
                         <span className="flex items-center gap-1">
                           <Clock className="w-3.5 h-3.5" />
                           {formatDate(job.created_at)}
                         </span>
                       </div>
                     </div>
                   </div>
 
                   <div className="flex items-center gap-3">
                     {getStatusBadge(job.status)}
 
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => setSelectedJob(job)}
                         >
                           <Eye className="w-4 h-4" />
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-2xl">
                         <DialogHeader>
                           <DialogTitle>Job Details</DialogTitle>
                           <DialogDescription>
                             View the configuration used for this job
                           </DialogDescription>
                         </DialogHeader>
                         {selectedJob && (
                           <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <p className="text-sm text-muted-foreground">Input File</p>
                                 <p className="font-medium">{selectedJob.input_filename}</p>
                               </div>
                               <div>
                                 <p className="text-sm text-muted-foreground">Status</p>
                                 {getStatusBadge(selectedJob.status)}
                               </div>
                               <div>
                                 <p className="text-sm text-muted-foreground">Preset</p>
                                 <p className="font-medium">{formatPreset(selectedJob.preset)}</p>
                               </div>
                               <div>
                                 <p className="text-sm text-muted-foreground">Model</p>
                                 <p className="font-medium">{selectedJob.model.split('/').pop()}</p>
                               </div>
                               <div>
                                 <p className="text-sm text-muted-foreground">Created</p>
                                 <p className="font-medium">{formatDate(selectedJob.created_at)}</p>
                               </div>
                               {selectedJob.completed_at && (
                                 <div>
                                   <p className="text-sm text-muted-foreground">Completed</p>
                                   <p className="font-medium">{formatDate(selectedJob.completed_at)}</p>
                                 </div>
                               )}
                             </div>
 
                             {selectedJob.style_rules && (
                               <div>
                                 <p className="text-sm text-muted-foreground mb-2">Style Rules Used</p>
                                 <ScrollArea className="h-40">
                                   <pre className="code-block text-xs whitespace-pre-wrap">
                                     {selectedJob.style_rules}
                                   </pre>
                                 </ScrollArea>
                               </div>
                             )}
 
                             {selectedJob.error_message && (
                               <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                                 <p className="text-sm text-destructive">{selectedJob.error_message}</p>
                               </div>
                             )}
                           </div>
                         )}
                       </DialogContent>
                     </Dialog>
 
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleDownload(job)}
                       disabled={job.status !== 'completed' || !job.output_file_path}
                       className="gap-2"
                     >
                       <Download className="w-4 h-4" />
                       Download
                     </Button>
                   </div>
                 </div>
               ))}
             </div>
           </CardContent>
         </Card>
       )}
     </div>
   );
 }