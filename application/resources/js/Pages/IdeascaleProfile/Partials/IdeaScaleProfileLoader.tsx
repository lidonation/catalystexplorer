
const IdeaScaleProfileLoader = () => {
  return (
    <div className="w-full rounded-xl bg-background p-4 shadow-sm">
      <div className="mb-2 w-full">
        <div>
          {/* Avatar skeleton */}
          <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
        </div>
        {/* Name skeleton */}
        <div className="mt-2 h-6 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      
      <div className="border-t-2 border-border-secondary">
        {/* Own proposals skeleton */}
        <div className="flex w-full justify-between pb-4 pt-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
        </div>
        
        {/* Co-proposals skeleton */}
        <div className="flex w-full justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default IdeaScaleProfileLoader;