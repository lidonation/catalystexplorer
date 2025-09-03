const FundCardLoader = () => {
    const fundCards = Array.from({ length: 6 }, (_, index) => index + 1);

    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fundCards.map((index) => (
                <div
                    className="bg-background flex w-full flex-col gap-6 rounded-lg p-4 shadow-xs sm:flex-row sm:gap-8 sm:p-6"
                    key={index}
                >
                    {/* Left Section: Avatar and Title Skeleton */}
                    <div className="flex max-w-[200px] min-w-[120px] flex-none flex-col items-center space-y-4 sm:w-1/3 sm:items-start sm:space-y-0">
                        {/* Title Skeleton */}
                        <div className="h-6 w-32 animate-pulse rounded-sm bg-gray-200" />

                        {/* Avatar Skeleton */}
                        <div className="h-24 w-24 animate-pulse rounded-full bg-gray-200 sm:h-36 sm:w-36" />
                    </div>

                    {/* Right Section: Details Skeleton */}
                    <div className="flex grow flex-col justify-center space-y-4 sm:w-2/3 sm:space-y-2">
                        {/* Total Allocated Skeleton */}
                        <div>
                            <p className="mb-2 h-4 w-32 animate-pulse rounded-sm bg-gray-200" />
                            <div className="flex items-baseline space-x-1">
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                                <span className="text-sm">/</span>
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                            <div className="mt-1 flex items-center space-x-1">
                                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-20 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                        </div>

                        {/* Funded Projects Skeleton */}
                        <div>
                            <p className="mb-2 h-4 w-32 animate-pulse rounded-sm bg-gray-200" />
                            <div className="flex items-baseline space-x-1">
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                                <span className="text-sm">/</span>
                                <div className="h-6 w-16 animate-pulse rounded-sm bg-gray-200" />
                            </div>
                            <div className="mt-1 flex items-center space-x-1">
                                <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
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
