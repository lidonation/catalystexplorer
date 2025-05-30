import Card from '@/Components/Card';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import React from 'react';

interface HeatMapProps {
    chartData: {
        fund: string | number;
        totalProposals: number;
        fundedProposals: number;
        completedProposals: number;
    }[];
    title?: string;
}

const HeatMap: React.FC<HeatMapProps> = ({ chartData, title }) => {
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

    // Custom color function that assigns colors based on series ID
    const getColor = (cell: any) => {
        const maxValue = Math.max(
            ...chartData.flatMap(item => [
                item.totalProposals,
                item.fundedProposals,
                item.completedProposals
            ])
        );
        
        // Handle null values
        const value = cell.value ?? 0;
        
        // Calculate opacity based on value (0.5 to 1.0 range)
        const opacity = Math.max(0.5, Math.min(1.0, value / maxValue));
        
        // Assign colors based on series ID
        switch (cell.serieId) {
            case 'Total Proposals':
                return `rgba(79, 173, 206, ${opacity})`; // #4fadce
            case 'Funded Proposals':
                return `rgba(238, 132, 52, ${opacity})`; // #ee8434
            case 'Completed Proposals':
                return `rgba(22, 179, 100, ${opacity})`; // #16B364
            default:
                return `rgba(79, 173, 206, ${opacity})`;
        }
    };

    return (
        <Card className="w-full pt-4">
            {title && (
                <Title level='4' className="mb-4 font-semibold">
                    {title}
                </Title>
            )}
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
                    labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 1.8]],
                    }}
                    animate={true}
                    motionConfig="wobbly"
                    colors={getColor}
                    isInteractive={true}
                    hoverTarget="cell"
                />
            </div>
        </Card>
    );
};

export default HeatMap;