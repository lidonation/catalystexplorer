import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsivePie } from '@nivo/pie';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PieChartProps {
    chartData: any;
    selectedFundIndex?: number;
}

const PieChart: React.FC<PieChartProps> = ({
    chartData,
    selectedFundIndex = 0,
}) => {
    const { t } = useTranslation();
    const [activeFundIndex, setActiveFundIndex] = useState(selectedFundIndex);

    const colors = ['#16B364', '#ee8434', '#4fadce'];

    const selectedFund = chartData[activeFundIndex];

    const pieData = [
        {
            id: 'Funded Proposals',
            label: 'Funded',
            value: selectedFund.fundedProposals,
            color: colors[0],
        },
        {
            id: 'Completed Proposals',
            label: 'Completed',
            value: selectedFund.completedProposals,
            color: colors[1],
        },
        {
            id: 'Submitted Proposals',
            label: 'Submitted',
            value: selectedFund.totalProposals - selectedFund.fundedProposals,
            color: colors[2],
        },
    ].filter((item) => item.value > 0);

    const total = selectedFund.totalProposals;
    const pieDataWithPercentages = pieData.map((item) => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    }));

    return (
        <Card className="w-full">
            <Title level="4" className="mb-4 font-semibold">
                {t('charts.pieChart')}
            </Title>

            <div className="mb-4">
                <Paragraph
                    className="mb-2 text-sm"
                    style={{ color: 'var(--cx-content-gray-persist)' }}
                >
                    {t('charts.selectFund')}
                </Paragraph>
                <select
                    value={activeFundIndex}
                    onChange={(e) => setActiveFundIndex(Number(e.target.value))}
                    className="rounded border px-3 py-2 text-sm"
                    style={{
                        backgroundColor: 'var(--cx-background)',
                        borderColor: 'var(--cx-border-color)',
                        color: 'var(--cx-content)',
                    }}
                >
                    {chartData.map((fund: any, index: number) => (
                        <option key={fund.fund} value={index}>
                            {fund.fund}
                        </option>
                    ))}
                </select>
            </div>

            {/* Fund Summary */}
            <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="text-center">
                    <Paragraph
                        className="text-sm"
                        style={{ color: 'var(--cx-content-gray-persist)' }}
                    >
                        {t('proposals.totalProposals')}
                    </Paragraph>
                    <Paragraph className="text-lg font-semibold">
                        {shortNumber(selectedFund.totalProposals, 2)}
                    </Paragraph>
                </div>
                <div className="text-center">
                    <Paragraph
                        className="text-sm"
                        style={{ color: 'var(--cx-content-gray-persist)' }}
                    >
                        {t('funds.fundedProposals')}
                    </Paragraph>
                    <Paragraph className="text-lg font-semibold">
                        {shortNumber(selectedFund.fundedProposals, 2)}
                    </Paragraph>
                </div>
                <div className="text-center">
                    <Paragraph
                        className="text-sm"
                        style={{ color: 'var(--cx-content-gray-persist)' }}
                    >
                        {t('charts.fundingRate')}
                    </Paragraph>
                    <Paragraph className="text-lg font-semibold">
                        {selectedFund.totalProposals > 0
                            ? `${((selectedFund.fundedProposals / selectedFund.totalProposals) * 100).toFixed(1)}%`
                            : '0%'}
                    </Paragraph>
                </div>
            </div>


            <div className="h-[400px]">
                <ResponsivePie
                    data={pieDataWithPercentages}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    innerRadius={0.5}
                    padAngle={2}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.2]],
                    }}
                    enableArcLinkLabels={true}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="var(--cx-content)"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                        from: 'color',
                        modifiers: [['darker', 2]],
                    }}
                    arcLabel={(d) => `${d.data.percentage}%`}
                    arcLinkLabel={(d) => d.data.label}
                    theme={{
                        background: 'transparent',
                        text: {
                            fill: 'var(--cx-content)',
                            fontSize: 12,
                        },
                        tooltip: {
                            container: {
                                background: 'var(--cx-background)',
                                color: 'var(--cx-content)',
                                fontSize: 12,
                                borderRadius: '8px',
                                border: '1px solid var(--cx-border-color)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            },
                        },
                    }}
                    tooltip={({ datum }) => (
                        <div
                            className="rounded-lg p-3"
                            style={{
                                backgroundColor: 'var(--cx-tooltip-background)',
                                color: 'var(--cx-content-light)',
                                border: '1px solid var(--cx-border-color)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: datum.color }}
                                />
                                <span className="font-semibold">
                                    {datum.data.label}
                                </span>
                            </div>
                            <div className="mt-1">
                                <div className="text-sm">
                                    {t('charts.value')}:{' '}
                                    <span className="font-semibold">
                                        {shortNumber(datum.value, 0)}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    {t('charts.percentage')}:{' '}
                                    <span className="font-semibold">
                                        {datum.data.percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 56,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: 'var(--cx-content)',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: 'var(--cx-content)',
                                    },
                                },
                            ],
                        },
                    ]}
                />
            </div>

            <div className="mt-4 space-y-2">
                {pieDataWithPercentages.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <Paragraph className="text-sm">
                                {item.label}
                            </Paragraph>
                        </div>
                        <div className="flex items-center gap-4">
                            <Paragraph className="text-sm font-semibold">
                                {shortNumber(item.value, 0)}
                            </Paragraph>
                            <Paragraph
                                className="text-sm"
                                style={{
                                    color: 'var(--cx-content-gray-persist)',
                                }}
                            >
                                {item.percentage}%
                            </Paragraph>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default PieChart;
