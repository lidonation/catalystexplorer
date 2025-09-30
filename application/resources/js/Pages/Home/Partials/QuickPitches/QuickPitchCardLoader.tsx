import Card from '@/Components/Card';

export default function QuickPitchCardLoader() {
    return (
        <Card>
            {/* Video player area skeleton */}
            <div className="bg-border-secondary aspect-[16/8] w-full animate-pulse rounded-xl"></div>
            
            {/* Title skeleton */}
            <div className="mt-4">
                <div className="bg-border-secondary h-5 w-full animate-pulse rounded-sm"></div>
                <div className="bg-border-secondary mt-2 h-5 w-3/4 animate-pulse rounded-sm"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="mt-4 flex justify-between">
                <div className="flex flex-col items-center">
                    <div className="bg-border-secondary h-3 w-16 animate-pulse rounded-sm"></div>
                    <div className="bg-border-secondary mt-1 h-4 w-6 animate-pulse rounded-sm"></div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-border-secondary h-3 w-16 animate-pulse rounded-sm"></div>
                    <div className="bg-border-secondary mt-1 h-4 w-6 animate-pulse rounded-sm"></div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-border-secondary h-3 w-20 animate-pulse rounded-sm"></div>
                    <div className="bg-border-secondary mt-1 h-4 w-6 animate-pulse rounded-sm"></div>
                </div>
            </div>
            
            {/* Budget and progress bar skeleton */}
            <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2">
                    <div className="bg-border-secondary h-4 w-12 animate-pulse rounded-sm"></div>
                    <div className="flex flex-col items-end">
                        <div className="bg-border-secondary h-4 w-32 animate-pulse rounded-sm"></div>
                        <div className="bg-border-secondary mt-1 h-3 w-20 animate-pulse rounded-sm"></div>
                    </div>
                </div>
                
                {/* Progress bar skeleton */}
                <div className="bg-content-light mt-2 h-3 w-full overflow-hidden rounded-full">
                    <div className="bg-border-secondary h-full w-1/3 animate-pulse rounded-full"></div>
                </div>
            </div>
        </Card>
    );
}