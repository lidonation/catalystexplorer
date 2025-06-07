import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import React, { useEffect, useState } from 'react';
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

    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const defaultColors = ['#4fadce', '#ee8434', '#16B364'];

    const fundLabels = chartData.map((item: any) => item.fund);
    const labelToIndex = (label: any) => fundLabels.indexOf(label);

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

    const getResponsiveConfig = () => {
        const isSmall = screenWidth < 480;
        const isMedium = screenWidth < 768;

        return {
            height: '400px',
            minHeight: isSmall ? '400px' : '500px',

            margin: {
                top: 50,
                right: isSmall ? 20 : isMedium ? 30 : 50,
                bottom: isSmall ? 160 : isMedium ? 140 : 120,
                left: isSmall ? 50 : isMedium ? 50 : 80,
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
                className="min-w-[600px] sm:min-w-full"
                style={{ height: config.height, minHeight: config.minHeight }}
            >
                <ResponsiveScatterPlot
                    data={transformedData}
                    margin={config.margin}
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
                            direction: config.legendConfig.direction as
                                | 'row'
                                | 'column',
                            translateY: config.legendConfig.translateY,
                            translateX: config.legendConfig.translateX,
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
                                    fontSize: 16,
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
                                fontSize: config.fontSize.legendText,
                                fontWeight: 'bold',
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
        </div>
    );
};

export default ScatterPlot;
