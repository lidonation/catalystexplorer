import Selector from '@/Components/Select';
import { ResponsiveBar } from '@nivo/bar';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FundsBarChartProps {
    funds: any;
    fundRounds: number;
    totalProposals: number;
    fundedProposals: number;
    totalFundsRequested: any;
    totalFundsAllocated: any;
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
    const [filters, setFilters] = useState([]);
    return (
        <div className="rounded-md bg-background lg:p-16 p-4 shadow-sm">
            <div className="flex w-full justify-between">
                <div>
                    <h6 className="text-2 lg:title-4 font-bold">
                        {fundRounds}
                    </h6>
                    <p className="text-4 lg:text-3 font-bold text-content opacity-75">
                        {t('funds.fundRounds')}
                    </p>
                </div>
                <div>
                    <h6 className="text-2 lg:title-4 font-bold">
                        {totalProposals.toLocaleString()}
                    </h6>
                    <p className="text-4 lg:text-3 font-bold text-content opacity-75">
                        {t('funds.totalProposals')}
                    </p>
                </div>
                <div>
                    <h6 className="text-2 lg:title-4 font-bold">
                        {fundedProposals.toLocaleString()}
                    </h6>
                    <p className="text-4 lg:text-2 font-bold text-content opacity-75">
                        {t('funds.fundedProposals')}
                    </p>
                </div>
                <div>
                    <h6 className="text-2 lg:title-4 font-bold">
                        {totalFundsRequested}
                    </h6>
                    <p className="text-4 lg:text-4 font-bold text-content opacity-75">
                        {t('funds.totalFundsRequested')}
                    </p>
                </div>
                <div>
                    <h6 className="text-2 lg:title-4 font-bold">
                        {totalFundsAllocated}
                    </h6>
                    <p className="text-4 lg:text-3 font-bold text-content opacity-75">
                        {t('funds.totalFundsAllocated')}
                    </p>
                </div>
            </div>
            {/* flex justify-end gap-8 mt-4 */}
            <div className='flex justify-end px-12 mt-4'>
                <Selector
                    isMultiselect={true}
                    options={[
                        { value: 'total_proposals', label: 'Total Proposals' },
                        {
                            value: 'funded_proposals',
                            label: 'Funded Proposals',
                        },
                        {
                            value: 'completed_proposals',
                            label: 'Completed Proposals',
                        },
                    ]}
                    setSelectedItems={setFilters}
                    selectedItems={filters}
                    placeholder={t('funds.filter')}
                />
            </div>
            <div style={{ height: '400px' }} className="w-full">
                <ResponsiveBar
                    data={funds}
                    keys={[
                        'Total Proposals',
                        'Funded Proposals',
                        'Completed Proposals',
                    ]}
                    indexBy="fund"
                    margin={{ top: 50, right: 50, bottom: 100, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    colors={['#4fadce', '#ee8434', '#16B364']}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: window.innerWidth < 600 ? 45 : 0,
                        legend: 'Fund',
                        legendPosition: 'middle',
                        legendOffset: window.innerWidth < 600 ? 60 : 40,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Total Proposals',
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
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: window.innerWidth < 600 ? 85 : 80,
                            itemsSpacing: window.innerWidth < 600 ? 12 : 2,
                            itemWidth: window.innerWidth < 600 ? 100 : 200,
                            itemHeight: window.innerWidth < 600 ? 5 : 20,
                            itemDirection: 'left-to-right',
                            symbolSize: 20,
                            symbolSpacing: window.innerWidth < 600 ? 0 : 5,
                            symbolShape: (props) => (
                                <rect
                                    x={window.innerWidth < 600 ? 5 : -10}
                                    y={window.innerWidth < 600 ? -6 : 2 }
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
                                fontSize: window.innerWidth < 600 ? 11 : 14,
                            },
                        },
                    }}
                    tooltip={({ indexValue, data }) => (
                        <div className="rounded-sm bg-dark p-4 text-content-light">
                            <p>
                                <strong className="mb-1 block">
                                    {indexValue}
                                </strong>
                            </p>
                            <p>
                                {`${t('funds.totalProposals')} : ${data['Total Proposals']}`}
                            </p>
                            <p>
                                {`${t('funds.fundedProposals')} : ${data['Funded Proposals']}`}
                            </p>
                            <p>
                                {`${t('funds.completedProposals')} : ${data['Completed Proposals']}`}
                            </p>
                        </div>
                    )}
                    animate={true}
                />
            </div>
        </div>
    );
};

export default FundsBarChart;
