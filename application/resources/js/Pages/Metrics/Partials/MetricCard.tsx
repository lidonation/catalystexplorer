import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTranslation } from 'react-i18next';
import MetricData = App.DataTransferObjects.MetricData;
import ArrowTrendingDown from '@/Components/svgs/ArrowTrendingDown';
import ArrowTrendingUp from '@/Components/svgs/ArrowTrendingUp';

interface MetricCardProps {
    metric: MetricData;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);

    const chartData = typeof metric.chartData === 'string'
        ? JSON.parse(metric.chartData)
        : metric.chartData;

    const lineData = chartData?.data ? [{
        id: chartData.id || 'Data',
        color: metric.color,
        data: chartData.data.map((item: any) => ({
            x: item.x,
            y: item.y
        }))
    }] : [];

    const formatNumber = (num: number): string => {
        if (Math.abs(num) >= 1_000_000_000_000) {
            return (num / 1_000_000_000_000).toFixed(1) + 'T';
        }
        if (Math.abs(num) >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1) + 'B';
        }
        if (Math.abs(num) >= 1_000_000) {
            return (num / 1_000_000).toFixed(1) + 'M';
        }
        if (Math.abs(num) >= 1_000) {
            return (num / 1_000).toFixed(1) + 'k';
        }
        return num.toFixed(0);
    };

    const calculateTrend = () => {
        if (lineData.length > 0 && lineData[0].data.length >= 2) {
            const data = lineData[0].data;
            const lastValue = data[data.length - 1].y;
            const previousValue = data[data.length - 2].y;
            const percentageChange = ((lastValue - previousValue) / previousValue) * 100;
            return {
                value: Math.abs(percentageChange).toFixed(0),
                isPositive: percentageChange >= 0
            };
        }
        return { value: '0', isPositive: true };
    };

    const trend = calculateTrend();

    return (
        <div className="w-full bg-background rounded-lg shadow-md flex flex-col h-full relative">
            <div className="absolute top-6 left-12 bg-background shadow-md rounded-md px-4 py-2">
                <span className="text-2xl font-bold text-content">
                    {formatNumber(parseFloat(metric.value?.toString() || '0'))}
                </span>
                <h3 className="text-sm font-medium text-content-gray-persist max-w-[200px] truncate">
                    {metric.title}
                </h3>
            </div>

            <div className="flex-grow flex flex-col justify-between mt-20">
                {lineData.length > 0 && (
                    <>
                        <div
                            className="w-full h-40"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <ResponsiveLine
                                data={lineData}
                                curve="cardinal"
                                margin={{ top: 10, right: 30, bottom: 40, left: 50 }}
                                xScale={{ type: 'point' }}
                                yScale={{ type: 'linear', min: 'auto', max: 'auto', clamp: true }}
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
                                    modifiers: [['brighter', 0.5]]
                                }}
                                pointBorderWidth={2}
                                pointBorderColor={{ from: 'serieColor' }}
                                useMesh={true}
                                tooltipFormat={(value) => formatNumber(Number(value))}
                                tooltip={({ point }) => (
                                    <div className="relative bg-dark text-white p-4 rounded-lg shadow-lg">
    <div className="max-w-sm">
        <h3 className="text-lg font-semibold">{point.data.xFormatted}</h3>
        <p className="mt-2 text-sm flex items-center">
            <span className="truncate flex-shrink">{metric.title}</span>:
            <span className="font-bold">{point.data.yFormatted}</span>
        </p>
        <div className="mt-2 flex items-center">
            <span className={`${trend.isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {trend.isPositive ? <ArrowTrendingUp /> : <ArrowTrendingDown />}
                <span className="ml-1 font-medium">{trend.value}%</span>
            </span>
            <span className="ml-1">{t('metric.vs')}</span>
        </div>
    </div>
    <div
        className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-full border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-dark"
    ></div>
</div>

                                )}
                                theme={{
                                    axis: {
                                        domain: {
                                            line: {
                                                stroke: 'var(--cx-border-color)',
                                                strokeWidth: 1,
                                            }
                                        },
                                        legend: {
                                            text: {
                                                fill: 'var(--cx-content-gray-persist)',
                                                fontSize: 16
                                            }
                                        },
                                        ticks: {
                                            text: {
                                                fill: 'var(--cx-content-gray-persist)',
                                                fontSize: 10
                                            }
                                        }
                                    },
                                    tooltip: {
                                        container: {
                                            background: 'var(--cx-background)',
                                            color: 'var(--cx-content)',
                                            fontSize: 12,
                                        }
                                    }
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
                                            { offset: 0, color: 'inherit', opacity: 1.0 },
                                            { offset: 1, color: 'inherit', opacity: 0.2 }
                                        ]
                                    }
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
