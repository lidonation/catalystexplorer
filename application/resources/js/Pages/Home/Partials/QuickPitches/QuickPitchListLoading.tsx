interface QuickPitchCardSkeletonProps {
    type?: 'featured' | 'regular';
    className?: string;
}

const QuickPitchCardSkeleton = ({ type = 'regular', className = '' }: QuickPitchCardSkeletonProps) => {
    const aspectRatio = type === 'featured' ? 'aspect-[32/8]' : 'aspect-[16/8]';
    
    return (
        <div className={`bg-background rounded-xl p-4 shadow-sm ${className}`}>
            <div className="animate-pulse">
                <div className={`bg-light-gray-persist ${aspectRatio} rounded-lg mb-4`}></div>
                
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
};

export default function QuickPitchListLoading() {
    return (
        <div className="space-y-6">            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    <QuickPitchCardSkeleton 
                        type="featured" 
                        className="col-span-1 md:col-span-2" 
                    />
                    <QuickPitchCardSkeleton 
                        type="regular" 
                        className="col-span-1" 
                    />
                </div>
            </div>
        </div>
    );
}
