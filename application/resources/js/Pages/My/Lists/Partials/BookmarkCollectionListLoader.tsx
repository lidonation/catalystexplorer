import Card from "@/Components/Card"
import { Skeleton } from "@/Components/Skeleton"

export default function BookmarkCollectionListLoader() {
    const collections = Array.from({ length: 6 }, (_, index) => index + 1);
    return (
        <div className="grid grid-cols-1 gap-4">
            {collections.map((collection, index) => (
                <Card className="w-full ">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <div className="w-full space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full max-w-xl" />
                        </div>
                        <Skeleton className="h-10 w-28 rounded-md" />
                    </div>
                    <div className="pb-2">
                        <div className="flex items-center gap-6 py-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                    <div className="py-6">
                        <div className="grid grid-cols-5 gap-4 text-center">
                            {[...Array(5)].map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <Skeleton className="mx-auto h-10 w-16" />
                                    <Skeleton className="mx-auto h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-0">
                        <Skeleton className="h-1 w-full" />
                    </div>
                </Card>
            ))}
        </div>
    );
}
