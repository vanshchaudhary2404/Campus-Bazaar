export default function SkeletonCard() {
  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-muted rounded-full w-1/3" />
        <div className="h-4 bg-muted rounded-full w-4/5" />
        <div className="h-4 bg-muted rounded-full w-2/3" />
        <div className="h-6 bg-muted rounded-full w-1/2" />
        <div className="flex justify-between mt-2">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-20 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}
