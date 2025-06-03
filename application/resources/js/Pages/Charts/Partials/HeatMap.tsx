import Card from '@/Components/Card';
import Title from '@/Components/atoms/Title';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeatMapProps {
    chartData: {
        fund: string | number;
        totalProposals: number;
        fundedProposals: number;
        completedProposals: number;
    }[];
}

const HeatMap: React.FC<HeatMapProps> = ({ chartData }) => {
    const { t } = useTranslation();
    const transformedData = [
        {
            id: 'Total Proposals',
            data: chartData.map((item) => ({
                x: `Fund ${item.fund}`,
                y: item.totalProposals,
            })),
        },
        {
            id: 'Funded Proposals',
            data: chartData.map((item) => ({
                x: `Fund ${item.fund}`,
                y: item.fundedProposals,
            })),
        },
        {
            id: 'Completed Proposals',
            data: chartData.map((item) => ({
                x: `Fund ${item.fund}`,
                y: item.completedProposals,
            })),
        },
    ];

    const getColor = (cell: any) => {
        const maxValue = Math.max(
            ...chartData.flatMap((item) => [
                item.totalProposals,
                item.fundedProposals,
                item.completedProposals,
            ]),
        );

        const value = cell.value ?? 0;

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
        <Card className="w-full pt-4">
            <Title level="4" className="mb-4 font-semibold">
                {t('charts.heatMap')}
            </Title>
            <div className="h-[400px]">
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
        </Card>
    );
};

export default HeatMap;