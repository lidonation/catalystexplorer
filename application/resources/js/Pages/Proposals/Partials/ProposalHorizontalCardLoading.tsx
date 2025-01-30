export default function ProposalHorizontalCardLoading() {
    return (
        <div className="proposals-wrapper mt-4 grid w-full grid-cols-1 gap-4">
            {[1, 2, 3].map((proposal, index) => (
                <div
                    key={index}
                    className="bg-background relative flex max-h-screen min-h-[450px] flex-col space-y-6 overflow-auto rounded-xl p-6 shadow-lg md:flex-row md:space-y-0 md:space-x-6"
                >
                    {/* Left Section: Square Div taking full space */}
                    <div className="flex h-full w-[500px] flex-col items-start overflow-hidden rounded-xl">
                        {/* Square div occupying the entire space */}
                        <div className="bg-border-secondary h-full w-full animate-pulse rounded-sm"></div>
                    </div>

                    {/* Middle Section (Details, Funding, Users, etc.) */}
                    <div className="flex grow flex-col space-y-6 overflow-hidden">
                        <div className="flex h-full flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
                            {/* Funding and Users Section */}
                            <section className="h-full w-full overflow-auto md:w-1/2">
                                <div className="bg-border-secondary mb-6 h-6 w-24 animate-pulse rounded-sm"></div>
                                <div className="bg-border-secondary mb-4 h-8 w-32 animate-pulse rounded-sm"></div>
                                <div className="bg-border-secondary mb-4 h-4 w-24 animate-pulse rounded-sm"></div>
                            </section>

                            {/* Solution and Quick Pitch Section */}
                            <div className="h-full min-h-40 w-[500px] overflow-auto">
                                <div className="bg-border-secondary mb-4 h-6 w-32 animate-pulse rounded-sm"></div>
                                <div className="bg-border-secondary h-24 w-full animate-pulse rounded-sm"></div>
                            </div>
                        </div>

                        {/* Tab Section (Quick pitch and funding tabs) */}
                        <div className="border-t pt-6">
                            <div className="flex justify-between">
                                <div className="bg-border-secondary h-4 w-32 animate-pulse rounded-sm"></div>
                                <div className="bg-border-secondary h-4 w-32 animate-pulse rounded-sm"></div>
                            </div>
                        </div>

                        {/* Users Section Placeholder */}
                        <div className="bg-border-secondary mb-4 h-4 w-32 animate-pulse rounded-sm"></div>

                        {/* Footer Placeholder */}
                        <div className="bg-border-secondary mb-4 h-12 w-32 animate-pulse rounded-sm"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
