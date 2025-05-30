import Card from '@/Components/Card';
import Paragraph from '@/Components/atoms/Paragraph';
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
    const defaultColors = ['#4fadce', '#ee8434', '#16B364'];
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

    return (
        <Card className="w-full">
            {title && (
                <Paragraph size="lg" className="mb-4 font-semibold">
                    {title}
                </Paragraph>
            )}
            <div className="h-[400px]">
                <ResponsiveHeatMap
                    data={transformedData}
                    margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
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
                    colors={(cell) => {
                        const colorMap: Record<string, string> = {
                            totalProposals: '#4fadce',
                            fundedProposals: '#ee8434',
                            completedProposals: '#16B364',
                        };
                        return colorMap[cell.serieId] || '#ccc';
                    }}
                    isInteractive={true}
                    hoverTarget="cell"
                />
            </div>
        </Card>
    );
};

export default HeatMap;
