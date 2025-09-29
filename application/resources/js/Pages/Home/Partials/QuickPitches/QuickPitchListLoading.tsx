const QuickPitchCardSkeleton = () => (
    <div className="bg-background rounded-xl p-4 shadow-sm border border-content-light">
        <div className="animate-pulse">
            <div className="bg-light-gray-persist aspect-[16/8] rounded-lg mb-4"></div>
            
            <div className="space-y-2 mb-4">
                <div className="bg-light-gray-persist h-4 rounded w-4/5"></div>
                <div className="bg-light-gray-persist h-4 rounded w-3/5"></div>
            </div>
            
            <div className="flex justify-between mb-4">
                <div className="text-center">
                    <div className="bg-light-gray-persist h-3 rounded w-16 mb-1"></div>
                    <div className="bg-light-gray-persist h-4 rounded w-8"></div>
                </div>
                <div className="text-center">
                    <div className="bg-light-gray-persist h-3 rounded w-16 mb-1"></div>
                    <div className="bg-light-gray-persist h-4 rounded w-8"></div>
                </div>
                <div className="text-center">
                    <div className="bg-light-gray-persist h-3 rounded w-16 mb-1"></div>
                    <div className="bg-light-gray-persist h-4 rounded w-8"></div>
                </div>
            </div>
            
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <div className="bg-light-gray-persist h-3 rounded w-16"></div>
                    <div className="bg-light-gray-persist h-4 rounded w-24"></div>
                </div>
                <div className="bg-light-gray-persist h-3 rounded-full w-full"></div>
            </div>
        </div>
    </div>
);

export default function QuickPitchListLoading() {    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="animate-pulse">
                    <div className="bg-light-gray-persist h-8 rounded w-48 mb-6"></div>
                </div>
                <div className="animate-pulse">
                    <div className="bg-light-gray-persist h-4 rounded w-32"></div>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <QuickPitchCardSkeleton />
                    <QuickPitchCardSkeleton />
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <QuickPitchCardSkeleton />
                    <QuickPitchCardSkeleton />
                    <QuickPitchCardSkeleton />
                </div>
            </div>
        </div>
    );
}
