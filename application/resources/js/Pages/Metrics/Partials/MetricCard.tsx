import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveLine } from '@nivo/line';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';
import MetricData = App.DataTransferObjects.MetricData;

interface MetricCardProps {
    metric: MetricData;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const { t } = useLaravelReactI18n();
    const [isHovered, setIsHovered] = useState(false);

    const chartData =
        typeof metric.chartData === 'string'
            ? JSON.parse(metric.chartData)
            : metric.chartData;

    const lineData = [
        {
            id: chartData.id || 'Data',
            color: metric.color,
            data: chartData.data.map((item: any) => ({
                x: item.x,
                y: item.y,
            })),
        },
    ];

    const calculateTrend = (currentValue: number, previousValue: number) => {
        if (previousValue !== 0) {
            const percentageChange =
                ((currentValue - previousValue) / previousValue) * 100;
            return {
                value: Math.abs(percentageChange).toFixed(0),
                isPositive: percentageChange >= 0,
            };
        }
        return { value: '0', isPositive: true };
    };

    return (
        <div
            className="bg-background relative flex h-full w-full flex-col rounded-lg shadow-md"
            data-testid={`metric-card-${metric.id}`}
        >
            <div
                className="bg-background absolute top-4 left-12 rounded-md px-4 py-2 shadow-md"
                data-testid="metric-card-header"
            >
                <span className="text-content text-2xl font-bold">
                    {shortNumber(metric.value ?? 0, 2)}
                </span>
                <Title
                    level="3"
                    className="text-content-gray-persist max-w-[200px] truncate text-sm font-medium"
                    data-testid="metric-card-title"
                >
                    {metric.title}
                </Title>
            </div>

            <div
                className="mt-20 flex grow flex-col justify-between"
                data-testid="metric-card-chart"
            >
                {lineData.length > 0 && (
                    <>
                        <div
                            className="h-40 w-full"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <ResponsiveLine
                                data={lineData}
                                curve="cardinal"
                                margin={{
                                    top: 10,
                                    right: 30,
                                    bottom: 40,
                                    left: 50,
                                }}
                                xScale={{ type: 'point' }}
                                yScale={{
                                    type: 'linear',
                                    min: 0,
                                    max: 'auto',
                                    clamp: true,
                                }}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    legend: '',
                                    legendOffset: 0,
                                    format: (value) => value,
                                }}
                                axisLeft={{
                                    tickSize: 0,
                                    tickPadding: 0,
                                    legend: 'Amount',
                                    legendOffset: -30,
                                    legendPosition: 'middle',
                                    format: () => '',
                                }}
                                enableGridX={false}
                                enableGridY={true}
                                colors={metric.color}
                                pointSize={4}
                                pointColor={{
                                    from: 'color',
                                    modifiers: [['brighter', 1.5]],
                                }}
                                pointBorderWidth={2}
                                pointBorderColor={{ from: 'serieColor' }}
                                useMesh={true}
                                tooltip={({ point }) => {
                                    const xValue = point.data.x;
                                    const currentIndex =
                                        lineData[0].data.findIndex(
                                            (d: any) => d.x === xValue,
                                        );
                                    const currentData =
                                        lineData[0].data[currentIndex];
                                    const previousData =
                                        lineData[0].data[currentIndex - 1];

                                    const trend = previousData
                                        ? calculateTrend(
                                              currentData.y,
                                              previousData.y,
                                          )
                                        : { value: '0', isPositive: true };

                                    return (
                                        <div className="bg-tooltip relative rounded-lg p-4 text-white shadow-lg">
                                            <div className="max-w-sm">
                                                <Title
                                                    level="3"
                                                    className="text-lg font-semibold"
                                                >
                                                    {point.data.xFormatted}
                                                </Title>
                                                <Paragraph className="mt-2 flex items-center text-sm">
                                                    <span className="mr-1 shrink truncate">
                                                        {metric.title}
                                                    </span>
                                                    :
                                                    <span className="font-bold">
                                                        {shortNumber(
                                                            Number(
                                                                point.data
                                                                    .yFormatted,
                                                            ),
                                                            2,
                                                        )}
                                                    </span>
                                                </Paragraph>
                                                <div className="mt-2 flex items-center">
                                                    <span
                                                        className={
                                                            trend.isPositive
                                                                ? 'text-success'
                                                                : 'text-danger-strong'
                                                        }
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        {trend.isPositive ? (
                                                            <ArrowTrendingUp />
                                                        ) : (
                                                            <ArrowTrendingDown />
                                                        )}
                                                        <span className="ml-1 font-medium">
                                                            {trend.value}%
                                                        </span>
                                                    </span>
                                                    <span className="ml-1">
                                                        {t('metric.vs')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="border-t-dark absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-t-[10px] border-r-[10px] border-l-[10px] border-r-transparent border-l-transparent"></div>
                                        </div>
                                    );
                                }}
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
                                enableArea={true}
                                areaOpacity={0.8}
                                areaBlendMode="normal"
                                crosshairType="x"
                                defs={[
                                    {
                                        id: 'gradient',
                                        type: 'linearGradient',
                                        colors: [
                                            {
                                                offset: 0,
                                                color: 'inherit',
                                                opacity: 1.0,
                                            },
                                            {
                                                offset: 1,
                                                color: 'inherit',
                                                opacity: 0.2,
                                            },
                                        ],
                                    },
                                ]}
                                fill={[{ match: '*', id: 'gradient' }]}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
