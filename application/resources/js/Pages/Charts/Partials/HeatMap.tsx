import { ResponsiveHeatMap } from '@nivo/heatmap';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HeatMapProps {
    chartData: any[];
    viewBy?: 'fund' | 'year';
}

const HeatMap: React.FC<HeatMapProps> = ({ chartData, viewBy }) => {
    const { t } = useTranslation();
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const transformedData = [
        {
            id: 'Total Proposals',
            data: chartData.map((item) => ({
                x: viewBy === 'fund' ? `Fund ${item.fund}` : item.year,
                y: item.totalProposals ?? 0,
            })),
        },
        {
            id: 'Funded Proposals',
            data: chartData.map((item) => ({
                x: viewBy === 'fund' ? `Fund ${item.fund}` : item.year,
                y: item.fundedProposals ?? 0,
            })),
        },
        {
            id: 'Completed Proposals',
            data: chartData.map((item) => ({
                x: viewBy === 'fund' ? `Fund ${item.fund}` : item.year,
                y: item.completedProposals ?? 0,
            })),
        },
    ];

    const getColor = (cell: any) => {
        const value = cell.value ?? 0;
        
        // Return transparent color for zero values
        if (value === 0) {
            return 'transparent';
        }

        const maxValue = Math.max(
            ...chartData.flatMap((item) => [
                item.totalProposals,
                item.fundedProposals,
                item.completedProposals,
            ]),
        );

        const opacity = Math.max(0.5, Math.min(1.0, value / maxValue));

        switch (cell.serieId) {
            case 'Total Proposals':
                return `rgba(79, 173, 206, ${opacity})`;
            case 'Funded Proposals':
                return `rgba(238, 132, 52, ${opacity})`;
            case 'Completed Proposals':
                return `rgba(22, 179, 100, ${opacity})`;
            default:
                return `rgba(79, 173, 206, ${opacity})`;
        }
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