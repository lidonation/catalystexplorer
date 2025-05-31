import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CustomScatterPlotDatum {
    x: number;
    y: number;
    fund: string | number;
}

interface ScatterChartProps {
    chartData: any;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
}

const ScatterPlot: React.FC<ScatterChartProps> = ({
    chartData,
    title,
    xAxisLabel,
    yAxisLabel,
}) => {
    const { t } = useTranslation();

    const defaultColors = ['#4fadce', '#ee8434', '#16B364'];

    const fundLabels = chartData.map((item: any) => item.fund);
    const labelToIndex = (label: any) => fundLabels.indexOf(label);

    const transformedData = [
        {
            id: 'Total Proposals',
            data: chartData.map((item: any) => ({
                x: labelToIndex(item.fund),
                y: item.totalProposals,
                fund: item.fund,
            })) as CustomScatterPlotDatum[],
        },
        {
            id: 'Funded Proposals',
            data: chartData.map((item: any) => ({
                x: labelToIndex(item.fund),
                y: item.fundedProposals,
                fund: item.fund,
            })) as CustomScatterPlotDatum[],
        },
        {
            id: 'Completed Proposals',
            data: chartData.map((item: any) => ({
                x: labelToIndex(item.fund),
                y: item.completedProposals,
                fund: item.fund,
            })) as CustomScatterPlotDatum[],
        },
    ];

    const legend = yAxisLabel || 'Proposals';

    return (
        <Card className="w-full">
            <Title level="4" className="mb-4 font-semibold">
                {t('charts.scatterPlot')}
            </Title>
            <div className="h-[400px]">
                <ResponsiveScatterPlot
                    data={transformedData}
                    margin={{ top: 40, right: 100, bottom: 70, left: 80 }}
                    xScale={{
                        type: 'linear',
                        min: 0,
                        max: fundLabels.length - 1,
                    }}
                    xFormat={(x) => fundLabels[Number(x)] ?? x}
                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                    colors={defaultColors}
                    blendMode="normal"
                    nodeSize={10}
                    axisBottom={{
                        tickValues: fundLabels.map((_: any, i: any) => i),
                        format: (v) => fundLabels[v],
                        legend: xAxisLabel || 'Fund',
                        legendPosition: 'middle',
                        legendOffset: 46,
                    }}
                    axisLeft={{
                        legend: legend,
                        legendPosition: 'middle',
                        legendOffset: -60,
                        format: (value) =>
                            value >= 1_000_000
                                ? `${(value / 1_000_000).toFixed(1)}M`
                                : value >= 1_000
                                  ? `${(value / 1_000).toFixed(1)}K`
                                  : value,
                    }}
                    tooltip={({ node }) => {
                        const nodeData = node.data as CustomScatterPlotDatum;
                        return (
                            <div className="bg-tooltip rounded-lg p-4 text-white shadow-lg">
                                <Title
                                    level="3"
                                    className="text-lg font-semibold"
                                >
                                    {nodeData.fund}
                                </Title>
                                <Paragraph className="text-sm">
                                    <strong>{node.serieId}</strong>:{' '}
                                    {shortNumber(nodeData.y, 2)}
                                </Paragraph>
                            </div>
                        );
                    }}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            translateY: 70,
                            translateX: 50,
                            itemWidth: 120,
                            itemHeight: 16,
                            itemsSpacing: 2,
                            symbolShape: 'circle',
                        },
                    ]}
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
                                    fontSize: 12,
                                },
                            },
                            ticks: {
                                text: {
                                    fill: 'var(--cx-content-gray-persist)',
                                    fontSize: 10,
                                },
                            },
                        },
                        legends: {
                            text: {
                                fill: 'var(--cx-content)',
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
                />
            </div>
        </Card>
    );
};

export default ScatterPlot;
