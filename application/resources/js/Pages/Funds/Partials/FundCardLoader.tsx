const FundCardLoader = () => {
    const fundCards = Array.from({ length: 6 }, (_, index) => index + 1);

    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fundCards.map((index) => (
                <div className="w-full rounded-lg bg-background p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row gap-6 sm:gap-8" key={index}>
                    {/* Left Section: Avatar and Title Skeleton */}
                    <div className="flex-none flex flex-col items-center sm:items-start space-y-4 sm:space-y-0 sm:w-1/3 min-w-[120px] max-w-[200px]">
                        {/* Title Skeleton */}
                        <div className="h-6 w-32 animate-pulse rounded-sm bg-gray-200" />

                        {/* Avatar Skeleton */}
                        <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gray-200 animate-pulse" />
                    </div>

                    {/* Right Section: Details Skeleton */}
                    <div className="grow flex flex-col sm:w-2/3 justify-center space-y-4 sm:space-y-2">
                        {/* Total Allocated Skeleton */}
                        <div>
                            <p className="h-4 w-32 animate-pulse rounded-sm bg-gray-200 mb-2" />
                            <div className="flex items-baseline space-x-1">
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                                <span className="text-sm">/</span>
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                            <div className="flex items-center mt-1 space-x-1">
                                <div className="w-4 h-4 animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                        </div>

                        {/* Funded Projects Skeleton */}
                        <div>
                            <p className="h-4 w-32 animate-pulse rounded-sm bg-gray-200 mb-2" />
                            <div className="flex items-baseline space-x-1">
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                                <span className="text-sm">/</span>
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                            <div className="flex items-center mt-1 space-x-1">
                                <div className="w-4 h-4 animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FundCardLoader;
