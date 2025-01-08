import React, { useState } from 'react';
import { ResponsiveLine } from '@nivo/line';
import { useTranslation } from 'react-i18next';
import MetricData = App.DataTransferObjects.MetricData;

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

    const UpArrow = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
        >
            <g clipPath="url(#clip0_1076_36064)">
                <path d="M1.70711 18.7071C1.31658 19.0976 0.683417 19.0976 0.292893 18.7071C-0.0976311 18.3166 -0.0976311 17.6834 0.292893 17.2929L7.79289 9.79289C8.18342 9.40237 8.81658 9.40237 9.20711 9.79289L13.5 14.0858L20.5858 7H17C16.4477 7 16 6.55228 16 6C16 5.44772 16.4477 5 17 5H22.9993C23.0003 5 23.002 5 23.003 5C23.1375 5.0004 23.2657 5.02735 23.3828 5.07588C23.5007 5.12468 23.6112 5.19702 23.7071 5.29289C23.8902 5.47595 23.9874 5.71232 23.9989 5.95203C23.9996 5.96801 24 5.984 24 6C24 6.00033 24 5.99967 24 6V12C24 12.5523 23.5523 13 23 13C22.4477 13 22 12.5523 22 12V8.41421L14.2071 16.2071C13.8166 16.5976 13.1834 16.5976 12.7929 16.2071L8.5 11.9142L1.70711 18.7071Z" fill="#000000"/>
            </g>
            <defs>
                <clipPath id="clip0_1076_36064">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    );

    const DownArrow = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
        >
            <g clipPath="url(#clip0_1076_36065)">
                <path d="M1.70711 5.29289C1.31658 4.90237 0.683417 4.90237 0.292893 5.29289C-0.0976311 5.68342 -0.0976311 6.31658 0.292893 6.70711L7.79289 14.2071C8.18342 14.5976 8.81658 14.5976 9.20711 14.2071L13.5 9.91421L20.5858 17H17C16.4477 17 16 17.4477 16 18C16 18.5523 16.4477 19 17 19H22.9993L23.003 19C23.1375 18.9996 23.2657 18.9727 23.3828 18.9241C23.5007 18.8753 23.6112 18.803 23.7071 18.7071C23.8902 18.524 23.9874 18.2877 23.9989 18.048C23.9996 18.032 24 18.016 24 18V12C24 11.4477 23.5523 11 23 11C22.4477 11 22 11.4477 22 12V15.5858L14.2071 7.79289C13.8166 7.40237 13.1834 7.40237 12.7929 7.79289L8.5 12.0858L1.70711 5.29289Z" fill="#000000"/>
            </g>
            <defs>
                <clipPath id="clip0_1076_36065">
                    <rect width="24" height="24" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    );

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
                                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
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
                                enableGridY={false}
                                colors={isHovered ? metric.color || '#8884d8' : '#d3d3d3'}
                                pointSize={4}
                                pointColor={{
                                    from: 'color',
                                    modifiers: [['brighter', 0.5]]
                                }}
                                pointBorderWidth={2}
                                pointBorderColor={{ from: 'serieColor' }}
                                useMesh={true}
                                tooltipFormat={(value) => formatNumber(Number(value))}
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
                                areaBaselineValue={0}
                                areaOpacity={0.8}
                                areaBlendMode="normal"
                                defs={[
                                    {
                                        id: 'gradient',
                                        type: 'linearGradient',
                                        colors: [
                                            { offset: 0, color: 'inherit', opacity: 1.0 },
                                            { offset: 60, color: 'inherit', opacity: 0.0 }
                                        ]
                                    }
                                ]}
                                fill={[{ match: '*', id: 'gradient' }]}
                            />
                        </div>
                        <div className="absolute top-4 right-10 flex items-center">
                            <div className={`flex items-center ${trend.isPositive ? 'text-success' : 'text-error'}`}>
                                {trend.isPositive ? <UpArrow /> : <DownArrow />}
                                <span className="font-medium ml-1">{trend.value}%</span>
                            </div>
                                <span className="text-content-gray-persist text-sm ml-2">{t('metric.vs')}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MetricCard;
