export default function MetricCardLoading() {
    return (
        <section className="numbers-wrapper py-16">
            <div className="container">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((metric, index) => (
                        <div
                            key={index}
                            className="bg-background relative h-48 rounded-lg shadow-md"
                        >
                            <div className="animate-pulse">
                                <div className="bg-background absolute top-4 left-10 z-10 rounded-md px-4 py-2 shadow-md">
                                    <div className="mb-2 h-8 w-24 rounded-sm bg-slate-200"></div>
                                    <div className="h-4 w-32 rounded-sm bg-slate-200"></div>
                                </div>

                                <div className="bg-background absolute top-4 right-10 flex items-center">
                                    <div className="h-6 w-20 rounded-sm bg-slate-200"></div>
                                </div>

                                <div className="bg-background mt-16 px-4">
                                    <div className="h-24 rounded-sm bg-slate-200"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
