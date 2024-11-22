export default function ProposalCardLoading() {
    return (
        <div
            className="w-full grid max-w-7xl grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((proposal, index) => (
                <div
                    key={index}
                    className="min-h-96 w-full rounded-xl bg-background p-4 shadow-lg"
                >
                    <div className="h-full animate-pulse space-y-4">
                        <div className="h-36 rounded-xl bg-slate-700"></div>
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 rounded bg-background-light"></div>
                            <div className="h-4 rounded bg-background-light"></div>
                            <div className="h-4 w-5/6 rounded bg-background-light"></div>
                        </div>
                        <div className="flex justify-between">
                            <div className="h-4 w-24 rounded bg-background-light"></div>
                            <div className="flex -space-x-2">
                                <div className="h-8 w-8 rounded-full bg-background-light"></div>
                                <div className="h-8 w-8 rounded-full bg-background-light"></div>
                                <div className="h-8 w-8 rounded-full bg-background-light"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
