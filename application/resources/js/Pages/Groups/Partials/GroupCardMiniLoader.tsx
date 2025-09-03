const GroupCardLoader = () => {
    const groupCardsMini = Array.from({ length: 6 }, (_, index) => index + 1);

    return (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupCardsMini.map((index) => (
                <div
                    className="bg-background flex flex-col rounded-lg p-4 shadow-md"
                    key={index}
                >
                    {/* Left Section: Avatar and Title Skeleton */}
                    <div className="flex h-full w-full flex-col items-center gap-4">
                        {/* Avatar Skeleton */}
                        <div className={`size-30 rounded-full bg-gray-200`} />

                        {/* Title Skeleton */}
                        <div className="h-6 w-32 animate-pulse rounded-sm bg-gray-200" />
                    </div>

                    {/* Right Section: Details Skeleton */}
                    <div className="flex w-full items-center justify-between">
                        <div>
                            <div className="text-primary bg-dark/10 mt-2 flex h-6 w-32 items-center justify-center rounded-md p-1" />

                            <div className="bg-dark/10 mt-2 h-6 w-32" />
                        </div>

                        <div>
                            <div className="bg-dark/10 mt-2 h-6 w-32" />
                            <div className="bg-dark/10 mt-2 h-6 w-32" />
                        </div>
                    </div>

                    <div>
                        <div className="mt-4 grid w-full grid-cols-2 gap-2">
                            <div className="mb-2 h-4 w-full animate-pulse rounded-sm bg-gray-200" />
                            <div className="mb-2 h-4 w-full animate-pulse rounded-sm bg-gray-200" />
                        </div>
                        <div className="bg-dark/10 mt-2 h-6 w-32" />
                    </div>
                    <div className="border-content-light mt-2 flex items-center justify-between border-t px-4 pt-3">
                        <div className="flex -space-x-2">
                            <div className="bg-dark/10 h-8 w-8 rounded-full"></div>
                            <div className="bg-dark/10 h-8 w-8 rounded-full"></div>
                            <div className="bg-dark/10 h-8 w-8 rounded-full"></div>
                        </div>
                        <div className="flex gap-1">
                            <div className="bg-dark/10 h-8 w-8 rounded-sm"></div>
                            <div className="bg-dark/10 h-8 w-8 rounded-sm"></div>
                            <div className="bg-dark/10 h-8 w-8"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GroupCardLoader;
