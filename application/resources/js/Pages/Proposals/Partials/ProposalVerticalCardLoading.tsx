export default function ProposalVerticalCardLoading() {
    return (
        <div className="proposals-wrapper grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 mt-4">
            {[1, 2, 3].map((proposal, index) => (
                <div
                    key={index}
                    className="min-h-96 w-full rounded-xl bg-background p-4 shadow-lg"
                >
                    <div className="flex h-full animate-pulse flex-col gap-y-4">
                        <div className="h-36 rounded-xl bg-border-secondary"></div>
                        <div className="flex flex-col gap-y-8 px-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-16 animate-pulse rounded bg-border-secondary" />
                                <div className="h-6 w-24 animate-pulse rounded-full bg-border-secondary" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-24 animate-pulse rounded bg-border-secondary" />
                                    <div className="h-4 w-28 animate-pulse rounded bg-border-secondary" />
                                </div>
                                <div className="h-2 w-full animate-pulse rounded-full bg-border-secondary" />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-800 p-4">
                            <div className="flex justify-between">
                                <div className="flex h-10 w-20 items-center border-b-2">
                                    <div className="h-4 w-full animate-pulse rounded bg-border-secondary" />
                                </div>
                                <div className="flex h-10 w-24 items-center">
                                    <div className="h-4 w-full animate-pulse rounded bg-border-secondary" />
                                </div>
                            </div>
                        </div>

                        {/* Solution Section */}
                        <div className="flex flex-col gap-y-8 px-4">
                            <div className="flex items-center justify-between">
                                <div className="h-4 w-20 animate-pulse rounded bg-border-secondary" />
                                <div className="h-2 w-16 animate-pulse rounded bg-border-secondary" />
                            </div>
                            <div className="space-y-2 py-8">
                                <div className="h-4 w-full animate-pulse rounded bg-border-secondary" />
                                <div className="h-4 w-full animate-pulse rounded bg-border-secondary" />
                                <div className="h-4 w-full animate-pulse rounded bg-border-secondary" />
                                <div className="h-4 w-[90%] animate-pulse rounded bg-border-secondary" />
                                <div className="h-4 w-[80%] animate-pulse rounded bg-border-secondary" />
                            </div>
                        </div>
                        <div className="flex justify-between px-4">
                            <div className="h-4 w-24 rounded bg-border-secondary"></div>
                            <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full bg-border-secondary"></div>
                                <div className="h-8 w-8 rounded-full bg-border-secondary"></div>
                                <div className="h-8 w-8 rounded-full bg-border-secondary"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
