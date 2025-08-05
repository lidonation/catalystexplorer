import Paragraph from '@/Components/atoms/Paragraph';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveBar } from '@nivo/bar';
import React, { useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface BarChartProps {
    chartData: any;
    viewBy?: 'fund' | 'year';
}

const BarChart: React.FC<BarChartProps> = ({ chartData, viewBy }) => {
    const { t } = useLaravelReactI18n();
    const { value: proposalTypes } = useUserSetting<
        string[]
    >(userSettingEnums.PROPOSAL_TYPE, []);
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const [normalizedData, setNormalizedData] = useState<any[]>([]);

    useEffect(() => {
        if (!chartData || chartData.length === 0) return;

        const tempData: Record<string, any> = {};

        chartData.forEach((series: any) => {
            series.data.forEach((point: any) => {
                const index = point.x;
                if (!tempData[index])
                    tempData[index] = { [viewBy as string]: index };
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

    const allKeys = [
        {
            key: 'Submitted Proposals',
            label: t('proposals.totalProposals'),
            color: '#4fadce',
            proposalType: 'submitted', 
        },
        {
            key: 'Funded Proposals',
            label: t('funds.fundedProposals'),
            color: '#ee8434',
            proposalType: 'approved',
        },
        {
            key: 'Completed Proposals',
            label: t('funds.completedProposals'),
            color: '#16B364',
            proposalType: 'complete',
        },
        {
            key: 'In Progress Proposals',
            label: t('funds.inProgressProposals'),
            color: '#ee8434',
            proposalType: 'in_progress', 
        },
        {
            key: 'Unfunded Proposals',
            label: t('charts.unfundedProposals'),
            color: '#4fadce',
            proposalType: 'unfunded', 
        },
    ];

    const getFilteredKeys = () => {
        if (!chartData || chartData.length === 0) return [];


        return allKeys.filter((keyItem) => {
            const isActive =
                proposalTypes?.includes(keyItem.proposalType) || false;
            return isActive;
        });
    };

    const activeKeys = getFilteredKeys();

    const colorMap = allKeys.reduce(
        (map, item) => {
            map[item.key] = item.color;
            return map;
        },
        {} as Record<string, string>,
    );

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
                left: isSmall ? 50 : isMedium ? 50 : 60,
            },

            tickRotation: isSmall ? 45 : isMedium ? 30 : 0,
            legendOffset: isSmall ? 50 : isMedium ? 45 : 40,
            leftLegendOffset: isSmall ? -40 : isMedium ? -45 : -50,

            legendConfig: {
                translateY: isSmall ? 140 : isMedium ? 120 : 80,
                translateX: isSmall ? 10 : isMedium ? 0 : 0,
                itemsSpacing: isSmall ? 5 : isMedium ? 8 : 10,
                itemWidth: isSmall
                    ? screenWidth / 3 - 20
                    : isMedium
                      ? 180
                      : 200,
                itemHeight: isSmall ? 16 : isMedium ? 18 : 20,
                symbolSize: isSmall ? 12 : isMedium ? 16 : 20,
                symbolSpacing: isSmall ? 8 : isMedium ? 10 : 12,
                direction: isSmall ? 'column' : 'row',
                symbolShape: {
                    x: isSmall ? 0 : isMedium ? -5 : -10,
                    y: 2,
                    width: isSmall ? 12 : isMedium ? 20 : 30,
                    height: isSmall ? 12 : isMedium ? 15 : 15,
                },
            },

            fontSize: {
                axis: isSmall ? 10 : isMedium ? 11 : 12,
                legend: isSmall ? 12 : isMedium ? 14 : 16,
                legendText: isSmall ? 10 : isMedium ? 12 : 14,
            },
        };
    };

    const config = getResponsiveConfig();

    return (
        <div>
            <div
                style={{
                    height: config.height,
                    minHeight: config.minHeight,
                }}
                className="min-w-[600px] sm:min-w-full"
            >
                <ResponsiveBar
                    groupMode="grouped"
                    data={normalizedData}
                    keys={activeKeys.map((item) => item.key)}
                    indexBy={viewBy === 'fund' ? 'fund' : 'year'}
                    margin={config.margin}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={({ id }: any) => colorMap[id as string]}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: config.tickRotation,
                        legend:
                            viewBy === 'fund'
                                ? t('funds.funds')
                                : t('charts.year'),
                        legendPosition: 'middle',
                        legendOffset: config.legendOffset,
                        format: (value) => {
                            if (
                                isMobile &&
                                typeof value === 'string' &&
                                value.length > 15
                            ) {
                                return value.substring(0, 12) + '...';
                            }
                            return value;
                        },
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: t('proposals.totalProposals'),
                        legendPosition: 'middle',
                        legendOffset: config.leftLegendOffset,
                        format: (value) => {
                            shortNumber(value, 2);
                        },
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="transparent"
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom',
                            direction: config.legendConfig.direction as
                                | 'row'
                                | 'column',
                            justify: false,
                            translateX: config.legendConfig.translateX,
                            translateY: config.legendConfig.translateY,
                            itemsSpacing: config.legendConfig.itemsSpacing,
                            itemWidth: config.legendConfig.itemWidth,
                            itemHeight: config.legendConfig.itemHeight,
                            itemDirection: 'left-to-right',
                            symbolSize: config.legendConfig.symbolSize,
                            symbolSpacing: config.legendConfig.symbolSpacing,
                            symbolShape: (props) => (
                                <rect
                                    x={config.legendConfig.symbolShape.x}
                                    y={config.legendConfig.symbolShape.y}
                                    rx={6}
                                    ry={6}
                                    width={
                                        config.legendConfig.symbolShape.width
                                    }
                                    height={
                                        config.legendConfig.symbolShape.height
                                    }
                                    fill={props.fill}
                                />
                            ),
                            data: activeKeys.map((item) => ({
                                id: item.key,
                                label: item.label,
                                color: item.color,
                            })),
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
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: 'var(--cx-content-dark)',
                                    fontSize: config.fontSize.axis,
                                    opacity: 0.7,
                                },
                            },
                            legend: {
                                text: {
                                    fill: 'var(--cx-content-dark)',
                                    fontSize: config.fontSize.legend,
                                    opacity: 0.7,
                                },
                            },
                        },
                        labels: {
                            text: {
                                fill: 'var(--cx-content)',
                                fontSize: 20,
                            },
                        },
                        legends: {
                            text: {
                                fill: 'var(--cx-content)',
                                fontWeight: 'bold',
                                fontSize: config.fontSize.legendText,
                            },
                        },
                    }}
                    tooltip={({ indexValue, data }) => (
                        <div
                            className={`bg-tooltip text-content-light rounded-xs p-${isMobile ? '2' : '4'} max-w-xs`}
                        >
                            <Paragraph size="sm">
                                <strong className="mb-1 block">
                                    {indexValue}
                                </strong>
                            </Paragraph>
                            {activeKeys.map((item) => (
                                <Paragraph
                                    size={isMobile ? 'xs' : 'sm'}
                                    key={item.key}
                                >
                                    {`${item.label}: ${data[item.key] || 0}`}
                                </Paragraph>
                            ))}
                        </div>
                    )}
                    animate={true}
                    motionConfig="gentle"
                />
            </div>
        </div>
    );
};

export default BarChart;

