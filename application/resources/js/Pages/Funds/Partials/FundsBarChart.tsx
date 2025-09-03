import Paragraph from '@/Components/atoms/Paragraph';
import RadioSelector from '@/Components/atoms/RadioSelector';
import Selector from '@/Components/atoms/Selector';
import { currency } from '@/utils/currency';
import { ResponsiveBar } from '@nivo/bar';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';

interface FundsBarChartProps {
    funds: any;
    fundRounds: number;
    totalProposals: number;
    fundedProposals: number;
    totalFundsRequested: number;
    totalFundsAllocated: number;
    viewBy: 'fund' | 'year';
    onViewByChange: (value: string | null) => void;
}

const FundsBarChart: React.FC<FundsBarChartProps> = ({
    funds,
    fundRounds,
    totalProposals,
    fundedProposals,
    totalFundsRequested,
    totalFundsAllocated,
    viewBy,
    onViewByChange,
}) => {
    const { t } = useLaravelReactI18n();

    const allKeys = [
        {
            value: t('charts.unfundedProposals'),
            label: t('charts.unfundedProposals'),
        },
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
        [t('charts.unfundedProposals')]: '#4fadce',
        [t('funds.fundedProposals')]: '#ee8434',
        [t('funds.completedProposals')]: '#16B364',
    };

    const getColors = () => {
        return filters.map((filter) => colorMap[filter]);
    };

    return (
        <div
            className="bg-background overflow-x-auto rounded-md p-4 shadow-xs lg:p-16"
            data-testid="funds-bar-chart-container"
        >
            <div className="grid w-full grid-cols-2 justify-between gap-4 lg:grid-cols-5">
                <div>
                    <h6
                        className="text-2 lg:title-5 font-bold"
                        data-testid="charts-fund-rounds"
                    >
                        {fundRounds}
                    </h6>
                    <Paragraph
                        size="sm"
                        className="text-4 lg:text-3 text-content font-bold opacity-75"
                    >
                        {t('funds.fundRounds')}
                    </Paragraph>
                </div>
                <div>
                    <h6
                        className="text-2 lg:title-5 font-bold"
                        data-testid="charts-total-proposals"
                    >
                        {totalProposals.toLocaleString()}
                    </h6>
                    <Paragraph
                        size="sm"
                        className="text-4 lg:text-3 text-content font-bold opacity-75"
                    >
                        {t('proposals.totalProposals')}
                    </Paragraph>
                </div>

                <div>
                    <h6
                        className="text-2 lg:title-5 font-bold"
                        data-testid="charts-funded-proposals"
                    >
                        {fundedProposals.toLocaleString()}
                    </h6>
                    <Paragraph
                        size="sm"
                        className="text-4 lg:text-3 text-content font-bold opacity-75"
                    >
                        {t('funds.fundedProposals')}
                    </Paragraph>
                </div>
                <div>
                    <h6
                        className="text-2 lg:title-5 font-bold"
                        data-testid="charts-total-funds-requested"
                    >
                        {currency(totalFundsRequested, 2, 'ADA')}
                    </h6>
                    <Paragraph
                        size="sm"
                        className="text-4 lg:text-3 text-content font-bold opacity-75"
                    >
                        {t('funds.totalFundsAwardedAda')}
                    </Paragraph>
                </div>
                <div>
                    <h6
                        className="text-2 lg:title-5 font-bold"
                        data-testid="charts-total-funds-awarded"
                    >
                        {currency(totalFundsAllocated, 2, 'USD')}
                    </h6>
                    <Paragraph
                        size="sm"
                        className="text-4 lg:text-3 text-content font-bold opacity-75"
                    >
                        {t('funds.totalFundsAwardedUsd')}
                    </Paragraph>
                </div>
            </div>

            <div className="mt-6 flex gap-4 md:justify-end md:px-8">
                <div className="flex items-center gap-2">
                    <Paragraph className="text-gray-persist">
                        {t('charts.viewBy')}
                    </Paragraph>
                    <RadioSelector
                        options={[
                            { label: t('charts.fund'), value: 'fund' },
                            { label: t('charts.year'), value: 'year' },
                        ]}
                        selectedItem={viewBy}
                        setSelectedItem={onViewByChange}
                        className="focus:border-primary focus:ring-primary"
                        data-testid="funds-view-by-selector"
                    />
                </div>
                <Selector
                    isMultiselect={true}
                    options={allKeys}
                    setSelectedItems={handleFilterChange}
                    selectedItems={filters}
                    placeholder={t('funds.filter')}
                    data-testid="funds-filter-selector"
                />
            </div>
            <div
                style={{ height: '400px', minHeight: '640px' }}
                className="min-w-[600px] sm:min-w-full"
            >
                <ResponsiveBar
                    data={funds}
                    keys={activeKeys}
                    indexBy={viewBy === 'fund' ? 'fund' : 'year'}
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
                        legend:
                            viewBy === 'fund'
                                ? t('funds.fund')
                                : t('charts.year'),
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
                            direction:
                                window.innerWidth < 600 ? 'column' : 'row',
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
                            <Paragraph
                                size="sm"
                                data-testid="funds-bar-chart-tooltip"
                            >
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
                    data-testid="funds-bar-chart"
                />
            </div>
        </div>
    );
};

export default FundsBarChart;
