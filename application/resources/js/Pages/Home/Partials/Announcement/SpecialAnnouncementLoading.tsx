const SpecialAnnouncementLoading = () => {
    return (
        <div className="flex w-full animate-pulse flex-col items-center p-6 lg:flex-row">
            {/* Skeleton for Text Section */}
            <div className="flex flex-1 flex-col space-y-6 text-center lg:mr-12 lg:text-left">
                {/* Title Skeleton */}
                <div className="bg-background mx-auto h-10 w-3/4 rounded-md lg:mx-0"></div>

                {/* Content Skeleton */}
                <div className="bg-background mx-auto h-6 w-5/6 rounded-md lg:mx-0"></div>
                <div className="bg-background mx-auto h-6 w-4/6 rounded-md lg:mx-0"></div>
                <div className="bg-background mx-auto h-6 w-2/3 rounded-md lg:mx-0"></div>

                {/* Button Skeletons */}
                <div className="flex flex-col justify-center space-y-4 lg:mt-8 lg:flex-row lg:justify-start lg:space-y-0 lg:space-x-4">
                    <div className="bg-background h-12 flex-1 rounded-md"></div>
                    <div className="bg-background h-12 flex-1 rounded-md"></div>
                </div>
            </div>

            {/* Skeleton for Image Section */}
            <div className="mt-6 w-full shrink-0 lg:mt-0 lg:ml-8 lg:w-[40%]">
                <div className="bg-background h-[500px] w-full rounded-lg"></div>
            </div>
        </div>
    );
};

export default SpecialAnnouncementLoading;
