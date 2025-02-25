const SpecialAnnouncementLoading = () => {
    return (
        <div className="flex flex-col lg:flex-row items-center p-6 w-full animate-pulse">
            {/* Skeleton for Text Section */}
            <div className="flex flex-col flex-1 lg:mr-12 text-center lg:text-left space-y-6">
                {/* Title Skeleton */}
                <div className="h-10 bg-background rounded-md w-3/4 mx-auto lg:mx-0"></div>

                {/* Content Skeleton */}
                <div className="h-6 bg-background rounded-md w-5/6 mx-auto lg:mx-0"></div>
                <div className="h-6 bg-background rounded-md w-4/6 mx-auto lg:mx-0"></div>
                <div className="h-6 bg-background rounded-md w-2/3 mx-auto lg:mx-0"></div>

                {/* Button Skeletons */}
                <div className="flex flex-col lg:flex-row justify-center lg:justify-start space-y-4 lg:space-y-0 lg:space-x-4 lg:mt-8">
                    <div className="flex-1 h-12 bg-background rounded-md"></div>
                    <div className="flex-1 h-12 bg-background rounded-md"></div>
                </div>
            </div>

            {/* Skeleton for Image Section */}
            <div className="shrink-0 w-full lg:w-[40%] mt-6 lg:mt-0 lg:ml-8">
                <div className="w-full h-[500px] bg-background rounded-lg"></div>
            </div>
        </div>
    );
};

export default SpecialAnnouncementLoading;
