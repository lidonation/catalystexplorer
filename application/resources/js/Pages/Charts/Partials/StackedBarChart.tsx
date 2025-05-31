import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { ResponsiveBar } from '@nivo/bar';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface BarChartProps {
    chartData: any;
}

const StackedBarChart: React.FC<BarChartProps> = ({ chartData }) => {
    const { t } = useTranslation();

    const allKeys = [
        {
            key: 'totalProposals',
            label: t('proposals.totalProposals'),
            color: '#4fadce',
        },
        {
            key: 'fundedProposals',
            label: t('funds.fundedProposals'),
            color: '#ee8434',
        },
        {
            key: 'completedProposals',
            label: t('funds.completedProposals'),
            color: '#16B364',
        },
    ];

    const colorMap = allKeys.reduce(
        (map, item) => {
            map[item.key] = item.color;
            return map;
        },
        {} as Record<string, string>,
    );

    return (
        <Card className="w-full">
            <Title level="4" className="mb-4 font-semibold">
                {t('charts.stackedBarChart')}
            </Title>
            <div
                style={{ height: '400px', minHeight: '640px' }}
                className="w-full"
            >
                <ResponsiveBar
                    data={chartData}
                    keys={allKeys.map((item) => item.key)}
                    indexBy="fund"
                    margin={{
                        top: 50,
                        right: 50,
                        bottom: window.innerWidth < 600 ? 200 : 100,
                        left: 60,
                    }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={({ id }) => colorMap[id as string]}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: window.innerWidth < 600 ? 45 : 0,
                        legend: t('funds.fund'),
                        legendPosition: 'middle',
                        legendOffset: window.innerWidth < 600 ? 60 : 40,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: t('proposals.totalProposals'),
                        legendPosition: 'middle',
                        legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="transparent"
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom',
                            direction: window.innerWidth < 600 ? 'row' : 'row',
                            justify: false,
                            translateX: window.innerWidth < 600 ? -40 : 0,
                            translateY: window.innerWidth < 600 ? 180 : 80,
                            itemsSpacing: window.innerWidth < 600 ? 10 : 2,
                            itemWidth: window.innerWidth < 600 ? 80 : 200,
                            itemHeight: window.innerWidth < 600 ? 16 : 20,
                            itemDirection: 'left-to-right',
                            symbolSize: window.innerWidth < 600 ? 16 : 20,
                            symbolSpacing: window.innerWidth < 600 ? 10 : 5,
                            symbolShape: (props) => (
                                <rect
                                    x={window.innerWidth < 600 ? 5 : -10}
                                    y={window.innerWidth < 600 ? 0 : 2}
                                    rx={6}
                                    ry={6}
                                    width={window.innerWidth < 600 ? 10 : 30}
                                    height={15}
                                    fill={props.fill}
                                />
                            ),
                            data: allKeys.map(item => ({
                                id: item.key,
                                label: item.label,
                                color: item.color
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
                                    fontSize: 12,
                                    opacity: 0.7,
                                },
                            },
                            legend: {
                                text: {
                                    fill: 'var(--cx-content-dark)',
                                    fontSize: 16,
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
                                fontSize: window.innerWidth < 600 ? 12 : 14,
                            },
                        },
                    }}
                    tooltip={({ indexValue, data }) => (
                        <div className="bg-tooltip text-content-light rounded-xs p-4">
                            <Paragraph size="sm">
                                <strong className="mb-1 block">
                                    {indexValue}
                                </strong>
                            </Paragraph>
                            {allKeys.map((item) => (
                                <Paragraph size="sm" key={item.key}>
                                    {`${item.label} : ${data[item.key] || 0}`}
                                </Paragraph>
                            ))}
                        </div>
                    )}
                    animate={true}
                />
            </div>
        </Card>
    );
};

export default StackedBarChart;