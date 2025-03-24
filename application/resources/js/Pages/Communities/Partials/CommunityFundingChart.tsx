import Paragraph from '@/Components/atoms/Paragraph';
import Selector from '@/Components/atoms/Selector';
import { ResponsiveLine } from '@nivo/line';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface CommunityFundingChartProps {
    adaData: { x: number; y: number }[];
    usdData: { x: number; y: number }[];
    filterOptions: { id:string; value: string; label: string }[];
    filtersTitle: string;
    chartTitle: string;
}

const CommunityFundingChart: React.FC<CommunityFundingChartProps> = ({
    adaData,
    usdData,
    filterOptions,
    filtersTitle,
    chartTitle,
}) => {
    const { t } = useTranslation();

    const data = [
        { id: 'ADA', color: '#2596be', data: adaData },
        { id: 'USD', color: '#dc2626', data: usdData },
    ];

    const filteredData = data.filter(item => 
        item.data && item.data.some(point => point.y !== 0)
    );

    const filteredOptions = filterOptions.filter(option => 
        filteredData.some(item => item.id === option.id)
    );
    
    const [filters, setFilters] = useState<string[]>(
        filteredOptions.map((key) => key.value)
    );
    
    const handleFilterChange = (selectedItems: string[]) => {
        setFilters(selectedItems);
    };

    const chartData = filteredData.filter(item =>
        filters.includes(item.id)
    );

    return (
        <div className="bg-background rounded-md p-4 shadow-md">
            <div className="flex items-center justify-between">
                <Paragraph className="font-bold" size="md">
                    {chartTitle}
                </Paragraph>

                <div className="mt-4">
                    <Selector
                        isMultiselect={true}
                        options={filteredOptions}
                        setSelectedItems={handleFilterChange}
                        selectedItems={filters}
                        placeholder={filtersTitle}
                    />
                </div>
            </div>
            <div className="h-[300px]">
                <ResponsiveLine
                    data={chartData}
                    margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
                    xScale={{ type: 'point' }}
                    yScale={{
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: false,
                        reverse: false,
                    }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Fund',
                        legendOffset: 36,
                        legendPosition: 'middle',
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Amount Awarded',
                        legendOffset: -60,
                        legendPosition: 'middle',
                        format: (value) =>
                            value >= 1_000_000
                                ? `${(value / 1_000_000).toFixed(1)}M`
                                : value >= 1_000
                                  ? `${(value / 1_000).toFixed(1)}K`
                                  : value,
                    }}
                    colors={{ datum: 'color' }}
                    lineWidth={3}
                    pointSize={0}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={false}
                    enableArea={true}
                    areaBaselineValue="auto"
                    areaOpacity={0.1}
                    fill={[{ match: '*', id: 'gradient' }]}
                />
            </div>
        </div>
    );
};

export default CommunityFundingChart;
