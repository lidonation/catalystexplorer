export default function PostListLoader() {
    return (
        <ul className="content-gap scrollable snaps-scrollable">
            {Array.from({ length: 4 }).map((_, index) => (
                <li key={index}>
                    <article className="flex w-full flex-col gap-4">
                        <div className="aspect-video h-auto w-full animate-pulse rounded-lg bg-gray-300"></div>
                        <div className="flex items-center">
                            <div className="h-4 w-1/4 animate-pulse rounded-lg bg-gray-300"></div>
                            <div className="mr-2 ml-2 h-1.5 w-1.5 rounded-full bg-gray-300"></div>
                            <div className="h-4 w-1/5 animate-pulse rounded-lg bg-gray-300"></div>
                        </div>
                        <div className="mb-4 flex flex-col gap-4">
                            <div className="h-6 w-full animate-pulse rounded-lg bg-gray-300"></div>
                            <div className="flex flex-col gap-2">
                                <div className="h-4 w-full animate-pulse rounded-lg bg-gray-300"></div>
                                <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-300"></div>
                            </div>
                        </div>
                    </article>
                </li>
            ))}
        </ul>
    );
}
