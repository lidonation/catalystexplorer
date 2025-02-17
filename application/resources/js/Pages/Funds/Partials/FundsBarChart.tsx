import Selector from '@/Components/atoms/Selector';
import { currency } from '@/utils/currency';
import { ResponsiveBar } from '@nivo/bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from '@/Components/atoms/Paragraph';


interface FundsBarChartProps {
    funds: any;
    fundRounds: number;
    totalProposals: number;
    fundedProposals: number;
    totalFundsRequested: number;
    totalFundsAllocated: number;
}

const FundsBarChart: React.FC<FundsBarChartProps> = ({
    funds,
    fundRounds,
    totalProposals,
    fundedProposals,
    totalFundsRequested,
    totalFundsAllocated,
}) => {
    const { t } = useTranslation();

    const allKeys = [
        { value: t('funds.totalProposals'), label: t('funds.totalProposals') },
        {
            value: t('funds.fundedProposals'),
            label: t('funds.fundedProposals'),
        },
        {
            value: t('funds.completedProposals'),
            label: t('funds.completedProposals'),
        },
    ];

    const [filters, setFilters] = useState<string[]>(
        allKeys.map((key) => key.value),
    );

    const handleFilterChange = (selectedItems: string[]) => {
        setFilters(selectedItems);
    };

    const activeKeys = filters.length > 0 ? filters : [];

    const colorMap = {
        [t('funds.totalProposals')]: '#4fadce',
        [t('funds.fundedProposals')]: '#ee8434',
        [t('funds.completedProposals')]: '#16B364',
    };

    const getColors = () => {
        return filters.map((filter) => colorMap[filter]);
    };

    return (
        <div className="bg-background rounded-md p-8 shadow-xs lg:p-16">
            <div className="grid w-full grid-cols-2 justify-between gap-4 lg:grid-cols-5">
                <div>
                    <h6 className="text-2 lg:title-5 font-bold">
                        {fundRounds}
                    </h6>
                    <Paragraph size="sm" className="text-4 lg:text-3 text-content font-bold opacity-75">
                        {t('funds.fundRounds')}
                    </Paragraph>
                </div>
                <div>
                    <h6 className="text-2 lg:title-5 font-bold">
                        {totalProposals.toLocaleString()}
                    </h6>
                    <Paragraph size="sm" className="text-4 lg:text-3 text-content font-bold opacity-75">
                        {t('funds.totalProposals')}
                    </Paragraph>
                </div>

                <div>
                    <h6 className="text-2 lg:title-5 font-bold">
                        {fundedProposals.toLocaleString()}
                    </h6>
                    <Paragraph size="sm" className="text-4 lg:text-3 text-content font-bold opacity-75">
                        {t('funds.fundedProposals')}
                    </Paragraph>
                </div>
                <div>
                    <h6 className="text-2 lg:title-5 font-bold">
                        {currency(totalFundsRequested, 'ADA', undefined, 2)}
                    </h6>
                    <Paragraph size="sm" className="text-4 lg:text-3 text-content font-bold opacity-75">
                        {t('funds.totalFundsAwardedAda')}
                    </Paragraph>
                </div>
                <div>
                    <h6 className="text-2 lg:title-5 font-bold">
                        {currency(totalFundsAllocated, 'USD', undefined, 2)}
                    </h6>
                    <Paragraph size="sm" className="text-4 lg:text-3 font-bold text-content opacity-75">
                        {t('funds.totalFundsAwardedUsd')}
                    </Paragraph>
                </div>
            </div>

            <div className="mt-4 flex justify-end px-12">
                <Selector
                    isMultiselect={true}
                    options={allKeys}
                    setSelectedItems={handleFilterChange}
                    selectedItems={filters}
                    placeholder={t('funds.filter')}
                />
            </div>
            <div style={{ height: '400px' }} className="w-full">
                <ResponsiveBar
                    data={funds}
                    keys={activeKeys}
                    indexBy="fund"
                    margin={{
                        top: 50,
                        right: 50,
                        bottom: window.innerWidth < 600 ? 200 : 100,
                        left: 60,
                    }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={getColors()}
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
                        legend: t('funds.totalProposals'),
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
                            direction:
                                window.innerWidth < 600 ? 'column' : 'row',
                            justify: false,
                            translateX: window.innerWidth < 600 ? -40 : 0,
                            translateY: window.innerWidth < 600 ? 180 : 80,
                            itemsSpacing: window.innerWidth < 600 ? 10 : 2,
                            itemWidth: window.innerWidth < 600 ? 80 : 200,
                            itemHeight: window.innerWidth < 600 ? 20 : 20,
                            itemDirection: 'left-to-right',
                            symbolSize: 20,
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
                        <div className="bg-dark text-content-light rounded-xs p-4">
                            <Paragraph size="sm">
                                <strong className="mb-1 block">
                                    {indexValue}
                                </strong>
                            </Paragraph>
                            {activeKeys.map((key) => (
                                <Paragraph size="sm" key={key}>
                                    {`${key} : ${data[key] || 0}`}
                                </Paragraph>
                            ))}
                        </div>
                    )}
                    animate={true}
                />
            </div>
        </div>
    );
};

export default FundsBarChart;