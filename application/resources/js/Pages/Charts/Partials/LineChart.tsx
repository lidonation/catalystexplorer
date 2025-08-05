import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveLine } from '@nivo/line';
import React, { useEffect, useRef, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

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
    const { t } = useLaravelReactI18n();
    const { getFilter } = useFilterContext();
    const { value: proposalTypes } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_TYPE,
        [],
    );
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const [normalizedData, setNormalizedData] = useState<any[]>([]);

    useEffect(() => {
        if (!chartData || chartData.length === 0 || !viewBy) return;

        const tempData: Record<string, any> = {};

        chartData.forEach((series: any) => {
            series.data.forEach((point: any) => {
                const index = point.x;
                if (!tempData[index]) tempData[index] = { [viewBy]: index };
                tempData[index][series.id] = point.y;
            });
        });

        const finalData = Object.values(tempData);
        setNormalizedData(finalData);
    }, [chartData, viewBy]);

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

    const defaultColors = [
        '#4fadce',
        '#dc2626',
        '#ee8434',
        '#16B364',
        '#f59e0b',
    ];

    const isSubmittedSelected = proposalTypes?.includes('submitted');
    const isApprovedSelected = proposalTypes?.includes('approved')
    const isCompletedSelected = proposalTypes?.includes('complete');
    const isInProgressSelected = proposalTypes?.includes('in_progress');
    const isUnfundedSelected = proposalTypes?.includes('unfunded');

    const TransformedData = [
        {
            id: 'Submitted Proposals',
            color: defaultColors[0],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.submittedProposals ?? item['Submitted Proposals'] ?? 0,
            })),
            shouldShow: isSubmittedSelected,
        },
        {
            id: 'Funded Proposals',
            color: defaultColors[1],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.fundedProposals ?? item['Funded Proposals'] ?? 0,
            })),
            shouldShow: isApprovedSelected,
        },
        {
            id: 'Completed Proposals',
            color: defaultColors[2],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.completedProposals ?? item['Completed Proposals'] ?? 0,
            })),
            shouldShow: isCompletedSelected,
        },
        {
            id: 'Unfunded Proposals',
            color: defaultColors[3],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item.fund : item.year,
                y: item.unfundedProposals ?? item['Unfunded Proposals'] ?? 0,
            })),
            shouldShow: isUnfundedSelected,
        },
        {
            id: 'In Progress Proposals',
            color: defaultColors[1],
            data: normalizedData.map((item: any) => ({
                x: viewBy === 'fund' ? item?.fund : item.year,
                y:
                    item.inProgressProposals ??
                    item['In Progress Proposals'] ??
                    0,
            })),
            shouldShow: isInProgressSelected,
        },
    ].filter(
        (dataset) =>
            dataset.data.length > 0 && dataset.data.some((d) => d.y > 0),
    );

    const lineData = TransformedData.filter((dataset) => dataset?.shouldShow);

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
        (d) =>
            Array.isArray(d.data) &&
            d.data.length > 0 &&
            d.data.some((point) => point.y > 0),
    );

    // Debug logs
    useEffect(() => {
        console.log('Line data to render:', lineData);
        console.log('Has plottable data:', hasPlottableData);
        console.log('Filter states:', {
            isSubmittedSelected,
            isApprovedSelected,
            isCompletedSelected,
            isUnfundedSelected,
            isInProgressSelected,
        });
    }, [lineData, hasPlottableData]);

    // Show no data message if there's nothing to render
    if (!hasPlottableData || lineData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Paragraph size="md" className="text-content-light">
                    {t('charts.noDataAvailable') || 'No data available'}
                </Paragraph>
            </div>
        );
    }

    return (
        <div ref={badgeRef} className="relative">
            <div
                className="h-[400px] min-w-[600px] sm:min-w-full"
                style={{ height: config.height, minHeight: config.minHeight }}
            >
                <ResponsiveLine
                    data={lineData}
                    margin={config.margin}
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
                        tickRotation: isMobile ? -45 : 0,
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
                    pointSize={8}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    enablePoints={true}
                    useMesh={true}
                    enableArea={false}
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
                    tooltip={({ point }) => {
                        const currentX = point?.data?.x;
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
                            const currentIndex = dataset?.data.findIndex(
                                (d: any) => d.x == currentX,
                            );
                            const current = dataset?.data[currentIndex];
                            const previous =
                                currentIndex > 0
                                    ? dataset?.data[currentIndex - 1]
                                    : null;

                            const trend =
                                previous && current
                                    ? calculateTrend(current.y, previous.y)
                                    : { value: '0', isPositive: true };

                            return {
                                id: dataset?.id,
                                color: dataset?.color,
                                current,
                                previous,
                                trend,
                            };
                        });

                        const selectedData = dataWithPrevious;

                        return (
                            <div className="bg-tooltip max-w-sm rounded-lg p-4 text-white shadow-lg">
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
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default LineChart;
