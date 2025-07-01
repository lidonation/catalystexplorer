import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveLine } from '@nivo/line';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LineChartProps {
    chartData: any;
    yAxisLabel?: string;
    viewBy?: 'fund' | 'year';
}

const LineChart: React.FC<LineChartProps> = ({
    chartData,
    yAxisLabel,
    viewBy,
}) => {
    const { t } = useTranslation();
    const { getFilter } = useFilterContext();
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const [normalizedData, setNormalizedData] = useState<any[]>([]);

    useEffect(() => {
        if (!chartData || chartData.length === 0) {
            setNormalizedData([]);
            return;
        }

        const isSubmittedProposalsFormat =
            Array.isArray(chartData) &&
            chartData.length > 0 &&
            typeof chartData[0] === 'object' &&
            !chartData[0].hasOwnProperty('fund') &&
            !chartData[0].hasOwnProperty('year');

        if (isSubmittedProposalsFormat) {
            const fundKeys = Object.keys(chartData[0] || {});
            const normalized = fundKeys.map((fundKey, index) => ({
                fund: fundKey,
                year: fundKey,
                totalProposals: chartData[0]?.[fundKey] || 0,
            }));
            setNormalizedData(normalized);
        } else {
            const normalized = chartData.map((item: any) => ({
                ...item,
                totalProposals:
                    item.totalProposals ||
                    (item.unfundedProposals || 0) + (item.fundedProposals || 0),
            }));
            setNormalizedData(normalized);
        }
    }, [chartData]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const defaultColors = ['#4fadce', '#dc2626', '#ee8434'];

    const isSubmittedSelected =
        getFilter(ParamsEnum.SUBMITTED_PROPOSALS)?.includes('submitted') ||
        false;
    const isApprovedSelected =
        getFilter(ParamsEnum.APPROVED_PROPOSALS)?.includes('approved') || false;
    const isCompletedSelected =
        getFilter(ParamsEnum.COMPLETED_PROPOSALS)?.includes('complete') ||
        false;
    const isUnfundedSelected =
        getFilter(ParamsEnum.UNFUNDED_PROPOSALS)?.includes('unfunded') || false;

    const TransformedData = [
        {
            id: 'Total Proposals',
            color: defaultColors[0],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.totalProposals ?? 0,
            })),
            shouldShow: isSubmittedSelected,
        },
        {
            id: 'Funded Proposals',
            color: defaultColors[1],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.fundedProposals ?? 0,
            })),
            shouldShow: isApprovedSelected,
        },
        {
            id: 'Completed Proposals',
            color: defaultColors[2],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.completedProposals ?? 0,
            })),
            shouldShow: isCompletedSelected,
        },
        {
            id: 'Unfunded Proposals',
            color: defaultColors[0],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.unfundedProposals ?? 0,
            })),
            shouldShow: isUnfundedSelected,
        },
    ];

    const lineData = TransformedData.filter((dataset) => dataset.shouldShow);

    const legend = yAxisLabel || 'Proposals';

    const getResponsiveConfig = () => {
        const isSmall = screenWidth < 480;
        const isMedium = screenWidth < 768;

        return {
            height: '400px',
            minHeight: isSmall ? '400px' : '500px',

            margin: {
                top: 50,
                right: isSmall ? 20 : isMedium ? 30 : 50,
                bottom: isSmall ? 160 : isMedium ? 140 : 100,
                left: isSmall ? 40 : isMedium ? 50 : 60,
            },

            legendOffset: isSmall ? 45 : isMedium ? 40 : 36,
        };
    };

    const config = getResponsiveConfig();

    const [showTooltip, setShowTooltip] = useState(false);
    const badgeRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (showTooltip && badgeRef.current) {
            const rect = badgeRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top - 40,
                left: rect.left + rect.width / 2,
            });
        }
    }, [showTooltip]);

    const hasPlottableData = lineData?.some(
        (d) => Array.isArray(d.data) && d.data.length > 0,
    );

    return (
        <div ref={badgeRef} className="relative">
            <div
                className="h-[400px] min-w-[600px] sm:min-w-full"
                style={{ height: config.height, minHeight: config.minHeight }}
                ref={badgeRef}
            >
                <ResponsiveLine
                    data={lineData}
                    margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false,
                    }}
                    curve="catmullRom"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend:
                            viewBy === 'fund'
                                ? t('charts.fund')
                                : t('charts.year'),
                        legendOffset: config.legendOffset,
                        legendPosition: 'middle',
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: legend,
                        legendOffset: -60,
                        legendPosition: 'middle',
                        format: (value) => shortNumber(value, 2),
                    }}
                    colors={{ datum: 'color' }}
                    lineWidth={3}
                    pointSize={10}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={(point: any) =>
                        point.serieColor || point.color || defaultColors[0]
                    }
                    pointLabelYOffset={-12}
                    enablePoints={true}
                    useMesh={hasPlottableData}
                    enableArea={false}
                    fill={[{ match: '*', id: 'gradient' }]}
                    theme={{
                        grid: {
                            line: {
                                stroke: 'var(--cx-content-gray-persist)',
                                strokeWidth: 1,
                                strokeOpacity: 0.1,
                            },
                        },
                        axis: {
                            domain: {
                                line: {
                                    stroke: 'var(--cx-border-color)',
                                    strokeWidth: 1,
                                },
                            },
                            legend: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                    fontSize: 16,
                                },
                            },
                            ticks: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                    fontSize: 10,
                                },
                            },
                        },
                        tooltip: {
                            container: {
                                background: 'var(--cx-background)',
                                color: 'var(--cx-content)',
                                fontSize: 12,
                            },
                        },
                    }}
                    tooltipFormat={(value) => shortNumber(Number(value), 2)}
                    tooltip={({ point }) => {
                        const currentX = point.data.x;

                        const calculateTrend = (
                            currentY: number,
                            previousY: number,
                        ) => {
                            if (!previousY || previousY === 0) {
                                return { value: '0', isPositive: true };
                            }

                            const percentageChange =
                                ((currentY - previousY) / previousY) * 100;

                            return {
                                value: Math.abs(percentageChange).toFixed(2),
                                isPositive: percentageChange >= 0,
                            };
                        };

                        const dataWithPrevious = lineData?.map((dataset) => {
                            const currentIndex = dataset.data.findIndex(
                                (d: any) => d.x == currentX,
                            );
                            const current = dataset.data[currentIndex];
                            const previous =
                                currentIndex > 0
                                    ? dataset.data[currentIndex - 1]
                                    : null;

                            const trend =
                                previous && current
                                    ? calculateTrend(current.y, previous.y)
                                    : { value: '0', isPositive: true };

                            return {
                                id: dataset.id,
                                color: dataset.color,
                                current,
                                previous,
                                trend,
                            };
                        });

                        const selectedData = dataWithPrevious;

                        return (
                            <div
                                className="bg-tooltip translate-x relative transform rounded-lg p-4 text-white shadow-lg"
                                style={{
                                    top: `${tooltipPosition.top}px`,
                                    left: `${tooltipPosition.left}px`,
                                }}
                            >
                                <div className="max-w-sm">
                                    <Title
                                        level="3"
                                        className="text-lg font-semibold"
                                    >
                                        {point.data.xFormatted}
                                    </Title>

                                    {selectedData.map((item: any) => (
                                        <div key={item.id} className="mt-2">
                                            <Paragraph className="flex items-center text-sm">
                                                <span
                                                    className="mr-1 shrink truncate"
                                                    style={{
                                                        color: item.color,
                                                    }}
                                                >
                                                    {item.id}
                                                </span>
                                                :
                                                <span className="ml-1 font-bold">
                                                    {shortNumber(
                                                        item?.current?.y ?? 0,
                                                        2,
                                                    )}
                                                </span>
                                            </Paragraph>

                                            <div className="mt-1 flex items-center">
                                                <span
                                                    className={
                                                        item.trend.isPositive
                                                            ? 'text-success'
                                                            : 'text-danger-strong'
                                                    }
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {item.trend.isPositive ? (
                                                        <ArrowTrendingUp />
                                                    ) : (
                                                        <ArrowTrendingDown />
                                                    )}
                                                    <span className="ml-1 font-medium">
                                                        {item.trend.value}%
                                                    </span>
                                                </span>
                                                <span className="ml-1">
                                                    {viewBy === 'fund'
                                                        ? t('metric.vs')
                                                        : t('charts.vsYear')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-dark absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-t-[10px] border-r-[10px] border-l-[10px] border-r-transparent border-l-transparent"></div>
                            </div>
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default LineChart;
