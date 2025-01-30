import { ResponsiveBar } from "@nivo/bar";

export default function FundsBarChartLoading() {
    return (
        <div className="bg-background rounded-md p-8 shadow-xs lg:p-16">
            {/* Numbers skeleton */}
            <div className="grid w-full grid-cols-2 justify-between gap-4 lg:grid-cols-5">
                <div>
                    <div className="bg-dark h-4 w-8 animate-pulse rounded-xs opacity-30 lg:h-8 lg:w-15" />
                    <div className="bg-dark mt-2 h-8 w-8 animate-pulse rounded-xs opacity-30 lg:h-4 lg:w-20" />
                </div>
                <div>
                    <div className="bg-dark h-4 w-10 animate-pulse rounded-xs opacity-30 lg:h-8 lg:w-15" />
                    <div className="bg-dark mt-2 h-8 w-12 animate-pulse rounded-xs opacity-30 lg:h-4 lg:w-20" />
                </div>
                <div>
                    <div className="bg-dark h-4 w-10 animate-pulse rounded-xs opacity-30 lg:h-8 lg:w-15" />
                    <div className="bg-dark mt-2 h-8 w-12 animate-pulse rounded-xs opacity-30 lg:h-4 lg:w-20" />
                </div>
                <div>
                    <div className="bg-dark h-4 w-12 animate-pulse rounded-xs opacity-30 lg:h-8 lg:w-15" />
                    <div className="bg-dark mt-2 h-8 w-12 animate-pulse rounded-xs opacity-30 lg:h-4 lg:w-20" />
                </div>
                <div>
                    <div className="bg-dark h-4 w-12 animate-pulse rounded-xs opacity-30 lg:h-8 lg:w-15" />
                    <div className="bg-dark mt-2 h-8 w-12 animate-pulse rounded-xs opacity-30 lg:h-4 lg:w-20" />
                </div>
            </div>
            {/* Selector skeleton */}
            <div className="sm:mb:4 mt-4 flex justify-end px-12">
                <div className="bg-dark h-8 w-12 w-15 animate-pulse rounded-xs opacity-30" />
            </div>

            {/* Bar chart skeleton */}
            <div
                style={{ height: '400px' }}
                className="bg-dark w-full rounded-md opacity-30"
            >
                <ResponsiveBar
                    data={[]}
                    keys={[]}
                    indexBy=""
                    margin={{ top: 50, right: 50, bottom: 100, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={[]}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: window.innerWidth < 600 ? 45 : 0,
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: window.innerWidth < 600 ? 60 : 40,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendPosition: 'middle',
                        legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="transparent"
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: window.innerWidth < 600 ? 85 : 80,
                            itemsSpacing: window.innerWidth < 600 ? 12 : 2,
                            itemWidth: window.innerWidth < 600 ? 100 : 200,
                            itemHeight: window.innerWidth < 600 ? 5 : 20,
                            itemDirection: 'left-to-right',
                            symbolSize: 20,
                            symbolSpacing: window.innerWidth < 600 ? 0 : 5,
                            symbolShape: (props) => (
                                <rect
                                    x={window.innerWidth < 600 ? 5 : -10}
                                    y={window.innerWidth < 600 ? -6 : 2}
                                    rx={6}
                                    ry={6}
                                    width={window.innerWidth < 600 ? 10 : 30}
                                    height={15}
                                    fill={props.fill}
                                />
                            ),
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 0.85,
                                    },
                                },
                            ],
                        },
                    ]}
                    animate={true}
                />
            </div>
        </div>
    );
}
