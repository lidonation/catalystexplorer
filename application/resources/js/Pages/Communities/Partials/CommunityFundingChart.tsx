import Paragraph from '@/Components/atoms/Paragraph';
import Selector from '@/Components/atoms/Selector';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveLine } from '@nivo/line';
import React, { useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface CommunityFundingChartProps {
    adaData: { x: number; y: number }[];
    usdData: { x: number; y: number }[];
    filterOptions: { id: string; value: string; label: string }[];
    filtersTitle: string;
    chartTitle: string;
    legend: string;
}

const CommunityFundingChart: React.FC<CommunityFundingChartProps> = ({
    adaData,
    usdData,
    filterOptions,
    filtersTitle,
    chartTitle,
    legend,
}) => {
    const { t } = useLaravelReactI18n();

    const data = [
        { id: 'ADA', color: '#2596be', data: adaData },
        { id: 'USD', color: '#dc2626', data: usdData },
    ];

    const filteredData = data.filter((item) => item.data);

    const [filters, setFilters] = useState<string[]>(
        filterOptions?.map((key) => key.value),
    );

    const handleFilterChange = (selectedItems: string[]) => {
        setFilters(selectedItems);
    };

    const chartData = data.filter((item) => filters.includes(item.id));

    return (
        <Card>
            <div className="flex items-center justify-between">
                <Paragraph className="font-bold" size="md">
                    {chartTitle}
                </Paragraph>

                <div className="mt-4">
                    <Selector
                        isMultiselect={true}
                        options={filterOptions}
                        setSelectedItems={handleFilterChange}
                        selectedItems={filters}
                        placeholder={filtersTitle}
                    />
                </div>
            </div>

            <div className="h-[400px]">
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false,
                    }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Fund',
                        legendOffset: 36,
                        legendPosition: 'middle',
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: legend,
                        legendOffset: -60,
                        legendPosition: 'middle',
                        format: (value) =>
                            value >= 1_000_000
                                ? `${(value / 1_000_000).toFixed(1)}M`
                                : value >= 1_000
                                  ? `${(value / 1_000).toFixed(1)}K`
                                  : value,
                    }}
                    colors={{ datum: 'color' }}
                    lineWidth={3}
                    pointSize={0}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    enableArea={true}
                    areaBaselineValue={0}
                    areaOpacity={0.1}
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
                                    fontSize: 12,
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
                        const xValue = point.data.x;

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

                        const dataWithPrevious = chartData.map((dataset) => {
                            const currentIndex = dataset?.data.findIndex(
                                (d) => d.x === xValue,
                            );
                            const current = dataset?.data[currentIndex];
                            const previous =
                                dataset?.data[currentIndex - 1] ?? null;

                            const trend = previous
                                ? calculateTrend(current?.y, previous?.y)
                                : { value: '0', isPositive: true };

                            return {
                                id: dataset?.id,
                                color: dataset?.color,
                                current,
                                previous,
                                trend,
                            };
                        });

                        return (
                            <div className="bg-tooltip relative rounded-lg p-4 text-white shadow-lg">
                                <div className="max-w-sm">
                                    <Title
                                        level="3"
                                        className="text-lg font-semibold"
                                    >
                                        {point.data.xFormatted}
                                    </Title>

                                    {dataWithPrevious.map((item) => (
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
                                                        item?.current?.y,
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
                                                    {t('metric.vs')}
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
        </Card>
    );
};

export default CommunityFundingChart;
