import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  type: 'panel' | 'timeline' | 'preview' | 'list';
}

export default function LoadingSkeleton({ type }: LoadingSkeletonProps) {
  if (type === 'panel') {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    );
  }

  if (type === 'timeline') {
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-1">
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
            <Skeleton className="h-7 w-7 rounded" />
          </div>
        </div>
        <Skeleton className="h-6 w-full rounded" />
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="w-24 h-16 rounded" />
            <Skeleton className="flex-1 h-16 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-12 rounded" />
            <Skeleton className="flex-1 h-12 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-10 rounded" />
            <Skeleton className="flex-1 h-10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'preview') {
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="flex-1 h-2 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    );
  }

  // list type
  return (
    <div className="p-3 space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      ))}
    </div>
  );
}
