import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HeatMapProps {
    chartData: any[];
    viewBy?: 'fund' | 'year';
}

const HeatMap: React.FC<HeatMapProps> = ({ chartData, viewBy }) => {
    const { t } = useTranslation();
    const { getFilter } = useFilterContext();
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
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allHeatMapKeys = [
        {
            id: 'Total Proposals',
            dataKey: 'totalProposals',
            filterParam: ParamsEnum.SUBMITTED_PROPOSALS,
            color: { r: 79, g: 173, b: 206 }, // #4fadce
        },
        {
            id: 'Funded Proposals',
            dataKey: 'fundedProposals',
            filterParam: ParamsEnum.APPROVED_PROPOSALS,
            color: { r: 238, g: 132, b: 52 }, // #ee8434
        },
        {
            id: 'Completed Proposals',
            dataKey: 'completedProposals',
            filterParam: ParamsEnum.COMPLETED_PROPOSALS,
            color: { r: 22, g: 179, b: 100 }, // #16B364
        },
        {
            id: 'In Progress Proposals',
            dataKey: 'inProgressProposals',
            filterParam: ParamsEnum.IN_PROGRESS,
            color: { r: 238, g: 132, b: 52 }, // #16B364
        },
        {
            id: 'Unfunded Proposals',
            dataKey: 'unfundedProposals',
            filterParam: ParamsEnum.UNFUNDED_PROPOSALS,
            color: { r: 79, g: 173, b: 206 }, // #16B364
        },
    ];

    const getActiveHeatMapKeys = () => {
        return allHeatMapKeys.filter((keyItem) => {
            const filterValue = getFilter(keyItem.filterParam);
            return filterValue && filterValue.length > 0;
        });
    };

    const activeKeys = getActiveHeatMapKeys();

    const transformedData = activeKeys.map((keyItem) => ({
        id: keyItem.id,
        data: normalizedData.map((item) => ({
            x: viewBy === 'fund' ? item.fund : item.year,
            y: item[keyItem.dataKey] ?? 0,
        })),
    }));

    const getColor = (cell: any) => {
        const value = cell.value ?? 0;

        const activeKey = activeKeys.find((key) => key.id === cell.serieId);

        const maxValue = Math.max(
            ...normalizedData.flatMap((item) =>
                activeKeys.map((key) => item[key.dataKey] || 0),
            ),
        );

        const opacity = Math.max(0.5, Math.min(1.0, value / maxValue));

        return `rgba(${activeKey?.color.r}, ${activeKey?.color.g}, ${activeKey?.color.b}, ${opacity})`;
    };

    const getResponsiveConfig = () => {
        const isSmall = screenWidth < 480;
        const isMedium = screenWidth < 768;

        return {
            height: '400px',
            minHeight: isSmall ? '400px' : '500px',

            margin: {
                top: 60,
                right: isSmall ? 30 : isMedium ? 60 : 90,
                bottom: isSmall ? 90 : isMedium ? 100 : 60,
                left: isSmall ? 60 : isMedium ? 100 : 150,
            },

            tickRotation: isSmall ? 45 : isMedium ? 30 : 0,
            legendOffset: isSmall ? 50 : isMedium ? 45 : 40,
            leftLegendOffset: isSmall ? -35 : isMedium ? -45 : -50,

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

    const CustomTooltip = ({ cell }: any) => (
        <div
            style={{
                backgroundColor: 'var(--cx-tooltip-background)',
                color: 'var(--cx-content-light)',
                padding: '12px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #4a5568',
            }}
        >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {cell.serieId}
            </div>
            <div>
                <strong>{cell.xKey}:</strong> {cell.value}
            </div>
        </div>
    );

    return (
        <div>
            <div
                className="min-w-[600px] sm:min-w-full"
                style={{ height: config.height, minHeight: config.minHeight }}
            >
                <ResponsiveHeatMap
                    data={transformedData}
                    margin={{ top: 60, right: 90, bottom: 60, left: 150 }}
                    axisTop={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -45,
                        legend: '',
                        legendOffset: 46,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendOffset: -72,
                    }}
                    labelTextColor="var(--cx-content)"
                    animate={true}
                    motionConfig="wobbly"
                    colors={getColor}
                    isInteractive={true}
                    hoverTarget="cell"
                    tooltip={CustomTooltip}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                },
                            },
                            legend: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                },
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default HeatMap;
