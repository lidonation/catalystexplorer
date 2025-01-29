export default function ProposalHorizontalCardLoading() {
    return (
        <div className="proposals-wrapper grid w-full grid-cols-1 gap-4 mt-4">
            {[1, 2, 3].map((proposal, index) => (
                <div
                    key={index}
                    className="relative flex flex-col md:flex-row rounded-xl bg-background p-6 shadow-lg md:space-x-6 space-y-6 md:space-y-0 min-h-[450px] max-h-screen overflow-auto"
                >
                    {/* Left Section: Square Div taking full space */}
                    <div className="flex flex-col w-[500px] h-full overflow-hidden items-start rounded-xl">
                        {/* Square div occupying the entire space */}
                        <div className="h-full w-full animate-pulse rounded-sm bg-border-secondary"></div>
                    </div>

                    {/* Middle Section (Details, Funding, Users, etc.) */}
                    <div className="flex flex-col grow space-y-6 overflow-hidden">
                        <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 h-full">
                            {/* Funding and Users Section */}
                            <section className="w-full md:w-1/2 h-full overflow-auto">
                                <div className="h-6 w-24 animate-pulse rounded-sm bg-border-secondary mb-6"></div>
                                <div className="h-8 w-32 animate-pulse rounded-sm bg-border-secondary mb-4"></div>
                                <div className="h-4 w-24 animate-pulse rounded-sm bg-border-secondary mb-4"></div>
                            </section>

                            {/* Solution and Quick Pitch Section */}
                            <div className="w-[500px] min-h-40 h-full overflow-auto">
                                <div className="h-6 w-32 animate-pulse rounded-sm bg-border-secondary mb-4"></div>
                                <div className="h-24 w-full animate-pulse rounded-sm bg-border-secondary"></div>
                            </div>
                        </div>

                        {/* Tab Section (Quick pitch and funding tabs) */}
                        <div className="border-t pt-6">
                            <div className="flex justify-between">
                                <div className="h-4 w-32 animate-pulse rounded-sm bg-border-secondary"></div>
                                <div className="h-4 w-32 animate-pulse rounded-sm bg-border-secondary"></div>
                            </div>
                        </div>

                        {/* Users Section Placeholder */}
                        <div className="h-4 w-32 animate-pulse rounded-sm bg-border-secondary mb-4"></div>

                        {/* Footer Placeholder */}
                        <div className="h-12 w-32 animate-pulse rounded-sm bg-border-secondary mb-4"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
