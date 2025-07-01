import Paragraph from '@/Components/atoms/Paragraph';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveBar } from '@nivo/bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BarChartProps {
    chartData: any;
    viewBy?: 'fund' | 'year';
}

const StackedBarChart: React.FC<BarChartProps> = ({ chartData, viewBy }) => {
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

    const allKeys = [
        {
            key: 'totalProposals',
            label: t('proposals.totalProposals'),
            color: '#4fadce',
            filterParam: ParamsEnum.SUBMITTED_PROPOSALS,
        },
        {
            key: 'unfundedProposals',
            label: t('charts.unfundedProposals'),
            color: '#4fadce',
            filterParam: ParamsEnum.UNFUNDED_PROPOSALS,
        },
        {
            key: 'fundedProposals',
            label: t('funds.fundedProposals'),
            color: '#ee8434',
            filterParam: ParamsEnum.APPROVED_PROPOSALS,
        },
        {
            key: 'completedProposals',
            label: t('funds.completedProposals'),
            color: '#16B364',
            filterParam: ParamsEnum.COMPLETED_PROPOSALS,
        },
    ];

    const getFilteredKeys = () => {
        if (!chartData || chartData.length === 0) return [];

        return allKeys.filter((keyItem) => {
            const filterValue = getFilter(keyItem.filterParam);
            const isFilterActive = filterValue && filterValue.length > 0;

            return isFilterActive;
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
                    data={normalizedData}
                    keys={activeKeys.map((item) => item.key)}
                    indexBy={viewBy === 'fund' ? 'fund' : 'year'}
                    margin={config.margin}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={({ id }) => colorMap[id as string]}
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

export default StackedBarChart;
