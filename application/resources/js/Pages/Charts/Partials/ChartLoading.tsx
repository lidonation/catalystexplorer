export function ChartLoading({
    chartType = 'bar',
}: {
    chartType?:
        | 'bar'
        | 'treemap'
        | 'line'
        | 'pie'
        | 'scatterplot'
        | 'stackedbar'
        | 'funnel'
        | string;
}) {
    const renderChartSkeleton = () => {
        switch (chartType) {
            case 'treemap':
                return (
                    <div className="grid h-full grid-cols-12 grid-rows-8 gap-1">
                        <div className="col-span-5 row-span-4 rounded bg-slate-200"></div>
                        <div className="col-span-3 row-span-4 rounded bg-slate-200"></div>
                        <div className="col-span-4 row-span-3 rounded bg-slate-200"></div>
                        <div className="col-span-2 row-span-2 rounded bg-slate-200"></div>
                        <div className="col-span-3 row-span-2 rounded bg-slate-200"></div>
                        <div className="col-span-2 row-span-1 rounded bg-slate-200"></div>
                        <div className="col-span-4 row-span-1 rounded bg-slate-200"></div>
                        <div className="col-span-3 row-span-2 rounded bg-slate-200"></div>
                        <div className="col-span-2 row-span-2 rounded bg-slate-200"></div>
                        <div className="col-span-2 row-span-1 rounded bg-slate-200"></div>
                    </div>
                );
            case 'line':
                return (
                    <div className="relative h-full">
                        <svg className="h-full w-full">
                            <path
                                d="M 20 200 Q 100 150 180 120 T 340 100 T 500 80"
                                stroke="#cbd5e1"
                                strokeWidth="3"
                                fill="none"
                                className="animate-pulse"
                            />
                            <path
                                d="M 20 180 Q 100 130 180 160 T 340 140 T 500 120"
                                stroke="#cbd5e1"
                                strokeWidth="3"
                                fill="none"
                                className="animate-pulse"
                            />
                        </svg>
                    </div>
                );
            case 'pie':
                return (
                    <div className="flex h-full items-center justify-center">
                        <div className="relative">
                            <div className="h-40 w-40 rounded-full bg-slate-200"></div>
                            <div className="absolute top-4 left-4 h-32 w-32 rounded-full bg-slate-100"></div>
                        </div>
                    </div>
                );
            case 'scatterplot':
                return (
                    <div className="relative h-full">
                        {/* Y-Axis */}
                        <div className="absolute top-0 left-0 flex h-full flex-col justify-between py-2">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-3 w-8 rounded-sm bg-slate-200"
                                ></div>
                            ))}
                        </div>
                        {/* X-Axis */}
                        <div className="absolute right-4 bottom-0 left-12 flex justify-between">
                            {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-3 w-8 rounded-sm bg-slate-200"
                                ></div>
                            ))}
                        </div>
                        {/* Scatter Points */}
                        <div className="relative mt-4 mr-4 mb-8 ml-12 h-full">
                            {/* Random scatter points */}
                            {[
                                { x: '15%', y: '25%', size: 'w-2 h-2' },
                                { x: '25%', y: '45%', size: 'w-3 h-3' },
                                { x: '35%', y: '20%', size: 'w-2 h-2' },
                                { x: '45%', y: '65%', size: 'w-3 h-3' },
                                { x: '55%', y: '35%', size: 'w-2 h-2' },
                                { x: '65%', y: '55%', size: 'w-3 h-3' },
                                { x: '75%', y: '30%', size: 'w-2 h-2' },
                                { x: '85%', y: '70%', size: 'w-2 h-2' },
                                { x: '20%', y: '80%', size: 'w-3 h-3' },
                                { x: '40%', y: '15%', size: 'w-2 h-2' },
                                { x: '60%', y: '85%', size: 'w-2 h-2' },
                                { x: '80%', y: '40%', size: 'w-3 h-3' },
                            ].map((point, index) => (
                                <div
                                    key={index}
                                    className={`absolute ${point.size} rounded-full bg-slate-200`}
                                    style={{
                                        left: point.x,
                                        top: point.y,
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                );
            case 'stackedbar':
                return (
                    <div className="relative h-full">
                        <div className="absolute top-0 left-0 flex h-full flex-col justify-between py-2">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-3 w-8 rounded-sm bg-slate-200"
                                ></div>
                            ))}
                        </div>
                        <div className="mr-4 ml-12 flex h-full items-end justify-between gap-2">
                            {[
                                { segments: [30, 25, 20] },
                                { segments: [40, 30, 15] },
                                { segments: [25, 35, 25] },
                                { segments: [35, 20, 30] },
                                { segments: [45, 25, 20] },
                                { segments: [30, 40, 15] },
                            ].map((bar, barIndex) => (
                                <div
                                    key={barIndex}
                                    className="flex flex-1 flex-col items-center gap-1"
                                >
                                    <div className="flex w-full flex-col">
                                        {bar.segments.map(
                                            (height, segIndex) => (
                                                <div
                                                    key={segIndex}
                                                    className={`w-full ${
                                                        segIndex === 0
                                                            ? 'bg-slate-200'
                                                            : segIndex === 1
                                                              ? 'bg-slate-300'
                                                              : 'bg-slate-400'
                                                    } ${segIndex === 0 ? 'rounded-t-sm' : ''}`}
                                                    style={{
                                                        height: `${height}px`,
                                                    }}
                                                ></div>
                                            ),
                                        )}
                                    </div>
                                    <div className="h-3 w-8 rounded-sm bg-slate-200"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'funnel':
                return (
                    <div className="relative flex h-full flex-col items-center justify-center gap-2">
                        {[
                            { width: '90%', label: 'Stage 1' },
                            { width: '75%', label: 'Stage 2' },
                            { width: '60%', label: 'Stage 3' },
                            { width: '45%', label: 'Stage 4' },
                            { width: '30%', label: 'Stage 5' },
                        ].map((stage, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-1"
                            >
                                <div
                                    className="relative flex h-8 items-center justify-center rounded bg-slate-200"
                                    style={{ width: stage.width }}
                                >
                                    {index < 4 && (
                                        <>
                                            <div className="absolute -bottom-2 left-0 h-0 w-0 border-t-4 border-r-4 border-l-4 border-t-slate-200 border-r-transparent border-l-transparent"></div>
                                            <div className="absolute right-0 -bottom-2 h-0 w-0 border-t-4 border-r-4 border-l-4 border-t-slate-200 border-r-transparent border-l-transparent"></div>
                                        </>
                                    )}
                                </div>
                                <div className="h-3 w-16 rounded-sm bg-slate-200"></div>
                                <div className="h-2 w-12 rounded-sm bg-slate-200"></div>
                            </div>
                        ))}
                    </div>
                );
            default: // bar
                return (
                    <div className="relative h-full">
                        <div className="absolute top-0 left-0 flex h-full flex-col justify-between py-2">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-3 w-8 rounded-sm bg-slate-200"
                                ></div>
                            ))}
                        </div>
                        <div className="mr-4 ml-12 flex h-full items-end justify-between gap-2">
                            {[65, 45, 80, 35, 90, 55, 70].map(
                                (height, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-1 flex-col items-center gap-1"
                                    >
                                        <div
                                            className="w-full rounded-t-sm bg-slate-200"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="h-3 w-8 rounded-sm bg-slate-200"></div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="chart-loading-wrapper" data-testid="charts-loader">
            <div className="bg-background relative h-fit rounded-lg p-6 shadow-md">
                <div className="animate-pulse">
                    <div className="mb-6">
                        <div className="mb-2 h-6 w-48 rounded-sm bg-slate-200"></div>
                        <div className="h-4 w-32 rounded-sm bg-slate-200"></div>
                    </div>

                    <div className="h-64 rounded-md bg-slate-100 p-4">
                        {renderChartSkeleton()}
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex justify-center gap-6">
                        {[1, 2, 3].map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <div className="h-3 w-3 rounded-sm bg-slate-200"></div>
                                <div className="h-3 w-16 rounded-sm bg-slate-200"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
