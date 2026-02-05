 import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
 import { Progress } from '@/components/ui/progress';
 import { cn } from '@/lib/utils';
 
 interface ProcessingStatusProps {
   status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
   progress?: number;
   message?: string;
 }
 
 export default function ProcessingStatus({ status, progress = 0, message }: ProcessingStatusProps) {
   if (status === 'idle') return null;
 
   const statusConfig = {
     uploading: {
       icon: Loader2,
       label: 'Uploading file...',
       iconClass: 'animate-spin text-primary',
       barClass: 'bg-primary',
     },
     processing: {
       icon: Loader2,
       label: 'AI is processing your edit...',
       iconClass: 'animate-spin text-primary',
       barClass: 'bg-primary',
     },
     completed: {
       icon: CheckCircle,
       label: 'Processing complete!',
       iconClass: 'text-success',
       barClass: 'bg-success',
     },
     failed: {
       icon: XCircle,
       label: 'Processing failed',
       iconClass: 'text-destructive',
       barClass: 'bg-destructive',
     },
     idle: {
       icon: Clock,
       label: '',
       iconClass: '',
       barClass: '',
     },
   };
 
   const config = statusConfig[status];
   const Icon = config.icon;
 
   return (
     <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3 animate-fade-in">
       <div className="flex items-center gap-3">
         <Icon className={cn('w-5 h-5', config.iconClass)} />
         <div className="flex-1">
           <p className="font-medium text-foreground">{message || config.label}</p>
           {status === 'processing' && (
             <p className="text-sm text-muted-foreground mt-0.5">
               This may take a minute depending on file size
             </p>
           )}
         </div>
       </div>
       
       {(status === 'uploading' || status === 'processing') && (
         <Progress 
           value={progress} 
           className={cn('h-2', status === 'processing' && 'animate-pulse')}
         />
       )}
     </div>
   );
 }