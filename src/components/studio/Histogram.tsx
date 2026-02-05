interface HistogramProps {
  data: number[] | null;
  height?: number;
  label?: string;
}

function downsample(data: number[], targetBins = 64) {
  if (data.length <= targetBins) return data;
  const bucketSize = Math.ceil(data.length / targetBins);
  const buckets = new Array(targetBins).fill(0);
  for (let i = 0; i < data.length; i++) {
    const bucket = Math.floor(i / bucketSize);
    buckets[bucket] += data[i];
  }
  return buckets.map((b) => b / bucketSize);
}

export default function Histogram({ data, height = 60, label }: HistogramProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label ?? 'Histogram'}</span>
        <span>—</span>
      </div>
    );
  }

  const buckets = downsample(data);
  const maxVal = Math.max(...buckets, 1);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{label ?? 'Histogram'}</span>
        <span className="font-mono opacity-70">max {Math.round(maxVal)}</span>
      </div>
      <div
        className="rounded-md overflow-hidden bg-black/50 border border-border/40"
        style={{ height }}
      >
        <div className="flex h-full">
          {buckets.map((value, idx) => (
            <div
              key={idx}
              className="flex-1 bg-gradient-to-t from-primary/40 to-primary/5"
              style={{ height: `${(value / maxVal) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
