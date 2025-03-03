interface IdeaScaleProfileLoaderProps {
    count?: number;
  }
  
  const IdeaScaleProfileLoader = ({ count = 1 }: IdeaScaleProfileLoaderProps) => {
    const loaderCount = Math.min(count, 20);
  
    return (
      <div className="profiles-wrapper mt-4 grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: loaderCount }).map((_, index) => (
          <div key={index} className="bg-background w-full rounded-xl p-4 shadow-xs">
            {/* Avatar placeholder */}
            <div className="mb-2 w-full">
              <div className="bg-gray-300 rounded-full h-12 w-12"></div>
              {/* Name placeholder */}
              <p className="text-2 mt-2 font-bold md:truncate bg-gray-300 h-6 w-32 rounded-sm"></p>
            </div>
  
            {/* SegmentedBar placeholder */}
            <div className="border-border-secondary border-t">
              <div className="flex w-full justify-between pt-4 pb-4">
                <div className="bg-gray-300 h-4 w-32 rounded-sm"></div>
              </div>
            </div>
  
            {/* Proposals count placeholder */}
            <div className="border-border-secondary mt-4 inline-flex items-center rounded-lg border border-2 px-4 py-2">
              <p className="text-3 text-content bg-gray-300 h-4 w-32 rounded-sm"></p>
              <p className="text-3 text-content ml-1 font-bold bg-gray-300 h-4 w-8 rounded-sm"></p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default IdeaScaleProfileLoader;
  