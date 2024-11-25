export default function MetricCardLoading() {
    return (
        <section className="numbers-wrapper py-16">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((metric, index) => (
                        <div
                            key={index}
                            className="bg-white border rounded-lg shadow-md h-48 relative"
                        >
                            <div className="animate-pulse">
                                <div className="absolute top-4 left-10 bg-white shadow-md rounded-md px-4 py-2 z-10">
                                    <div className="h-8 w-24 bg-slate-200 rounded mb-2"></div>
                                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                </div>

                                <div className="absolute top-4 right-10 flex items-center">
                                    <div className="h-6 w-20 bg-slate-200 rounded"></div>
                                </div>

                                <div className="mt-16 px-4">
                                    <div className="h-24 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
