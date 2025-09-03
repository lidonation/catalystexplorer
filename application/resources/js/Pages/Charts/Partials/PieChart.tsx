import Paragraph from '@/Components/atoms/Paragraph';
import { useFilterContext } from '@/Context/FiltersContext';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsivePie } from '@nivo/pie';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useState } from 'react';

interface PieChartProps {
    chartData: any;
    selectedOptionIndex?: number;
    viewBy?: 'fund' | 'year';
}

const PieChart: React.FC<PieChartProps> = ({
    chartData,
    selectedOptionIndex = 0,
    viewBy,
}) => {
    const { t } = useLaravelReactI18n();
    const { getFilter } = useFilterContext();
    const [activeOptionIndex, setActiveOptionIndex] =
        useState(selectedOptionIndex);
    const [isMobile, setIsMobile] = useState(false);
    const [normalizedData, setNormalizedData] = useState<any[]>([]);
    const { value: proposalTypes } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_TYPE,
        [],
    );

    useEffect(() => {
        if (!chartData || chartData.length === 0) return;

        const tempData: Record<string, any> = {};

        chartData.forEach((series: any) => {
            series.data.forEach((point: any) => {
                const index = point.x;
                if (!tempData[index])
                    tempData[index] = { [viewBy as string]: index };
                tempData[index][series.id] = point.y;
            });
        });

        const finalData = Object.values(tempData);
        setNormalizedData(finalData);
    }, [chartData, viewBy]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const safeActiveOptionIndex = Math.min(
        Math.max(0, activeOptionIndex),
        normalizedData.length - 1,
    );

    useEffect(() => {
        if (safeActiveOptionIndex !== activeOptionIndex) {
            setActiveOptionIndex(safeActiveOptionIndex);
        }
    }, [safeActiveOptionIndex, activeOptionIndex]);

    const colors = ['#16B364', '#ee8434', '#4fadce'];

    const selectedOption = normalizedData[safeActiveOptionIndex] || {};

    const isSubmittedSelected = proposalTypes?.includes('submitted');
    const isApprovedSelected = proposalTypes?.includes('approved');
    const isCompletedSelected = proposalTypes?.includes('complete');
    const isUnfundedSelected = proposalTypes?.includes('unfunded');
    const isInProgressSelected = proposalTypes?.includes('in_progress');

    const pieData = [];

    if (isApprovedSelected) {
        pieData.push({
            id: 'Funded Proposals',
            label: 'Funded',
            value: selectedOption['Funded Proposals'] ?? 0,
            color: colors[0],
        });
    }

    if (isCompletedSelected) {
        pieData.push({
            id: 'Completed Proposals',
            label: 'Completed',
            value: selectedOption['Completed Proposals'] ?? 0,
            color: colors[0],
        });
    }

    if (isUnfundedSelected) {
        pieData.push({
            id: 'Unfunded Proposals',
            label: 'Unfunded',
            value: selectedOption['Unfunded Proposals'] ?? 0,
            color: colors[2],
        });
    }

    if (isSubmittedSelected) {
        pieData.push({
            id: 'Submitted Proposals',
            label: 'Submitted',
            value: selectedOption['Submitted Proposals'] ?? 0,
            color: colors[2],
        });
    }

    if (isInProgressSelected) {
        pieData.push({
            id: 'In Progress Proposals',
            label: 'In Progress',
            value: selectedOption['In Progress Proposals'] ?? 0,
            color: colors[1],
        });
    }

    const filteredPieData =
        pieData.length > 1 ? pieData.filter((item) => item.value > 0) : pieData;

    let total = 0;
    if (isSubmittedSelected) {
        total = selectedOption['Submitted Proposals'] ?? 0;
    } else {
        total =
            (selectedOption['Completed Proposals'] ?? 0) +
            (selectedOption['Funded Proposals'] ?? 0) +
            (selectedOption['Unfunded Proposals'] ?? 0);
    }

    const pieDataWithPercentages = filteredPieData.map((item) => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    }));

    const chartConfig = {
        margin: isMobile
            ? { top: 20, right: 20, bottom: 60, left: 20 }
            : { top: 40, right: 80, bottom: 80, left: 80 },
        height: isMobile ? 300 : 400,
        innerRadius: isMobile ? 0.3 : 0.5,
        enableArcLinkLabels: !isMobile,
        arcLabelsSkipAngle: isMobile ? 15 : 10,
        arcLinkLabelsSkipAngle: isMobile ? 15 : 10,
        legendTranslateY: isMobile ? 80 : 56,
        legendDirection: isMobile ? ('column' as const) : ('row' as const),
        legendItemWidth: isMobile ? 80 : 100,
        legendItemHeight: isMobile ? 20 : 18,
    };

    return (
        <div>
            <div className="mb-4">
                <Paragraph className="text-content/70 mb-2 text-sm">
                    {viewBy === 'fund' ? t('charts.fund') : t('charts.year')}
                </Paragraph>
                <select
                    value={safeActiveOptionIndex}
                    onChange={(e) =>
                        setActiveOptionIndex(Number(e.target.value))
                    }
                    className="w-fit rounded border px-3 py-2 text-sm md:w-auto"
                    style={{
                        backgroundColor: 'var(--cx-background)',
                        borderColor: 'var(--cx-border-color)',
                        color: 'var(--cx-content)',
                    }}
                >
                    {normalizedData.length === 0 && (
                        <option value={-1} disabled>
                            {viewBy === 'fund'
                                ? t('charts.fund')
                                : t('charts.year')}
                        </option>
                    )}
                    {normalizedData.map((option: any, index: number) => (
                        <option key={index} value={index}>
                            {viewBy === 'fund'
                                ? (option?.fund ?? `Fund ${index + 1}`)
                                : (option?.year ?? `Year ${index + 1}`)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="my-4 mb-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <div className="text-center">
                    <Paragraph className="text-content/70 text-sm">
                        {t('proposals.totalProposals')}
                    </Paragraph>
                    <Paragraph className="text-lg font-semibold">
                        {shortNumber(
                            isSubmittedSelected
                                ? (selectedOption?.totalProposals ?? 0)
                                : total,
                            2,
                        )}
                    </Paragraph>
                </div>

                {isApprovedSelected && (
                    <div className="text-center">
                        <Paragraph className="text-content/70 text-sm">
                            {t('funds.fundedProposals')}
                        </Paragraph>
                        <Paragraph className="text-lg font-semibold">
                            {shortNumber(
                                selectedOption['Funded Proposals'] ?? 0,
                                2,
                            )}
                        </Paragraph>
                    </div>
                )}
            </div>

            <div style={{ height: `${chartConfig.height}px` }}>
                <ResponsivePie
                    data={pieDataWithPercentages}
                    margin={chartConfig.margin}
                    innerRadius={chartConfig.innerRadius}
                    padAngle={2}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ datum: 'data.color' }}
                    borderWidth={1}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.2]],
                    }}
                    enableArcLinkLabels={chartConfig.enableArcLinkLabels}
                    arcLinkLabelsSkipAngle={chartConfig.arcLinkLabelsSkipAngle}
                    arcLinkLabelsTextColor="var(--cx-content)"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={chartConfig.arcLabelsSkipAngle}
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
                            fontSize: isMobile ? 10 : 12,
                        },
                        tooltip: {
                            container: {
                                background: 'var(--cx-background)',
                                color: 'var(--cx-content)',
                                fontSize: isMobile ? 11 : 12,
                                borderRadius: '8px',
                                border: '1px solid var(--cx-border-color)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            },
                        },
                    }}
                    tooltip={({ datum }) => (
                        <div
                            className="w-40 rounded-lg p-2 sm:p-3"
                            style={{
                                backgroundColor: 'var(--cx-tooltip-background)',
                                color: 'var(--cx-content-light)',
                                border: '1px solid var(--cx-border-color)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                maxWidth: isMobile ? '200px' : 'none',
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 flex-shrink-0 rounded-full"
                                    style={{ backgroundColor: datum.color }}
                                />
                                <span className="text-sm font-semibold">
                                    {datum.data.label}
                                </span>
                            </div>
                            <div className="mt-1">
                                <div className="text-xs sm:text-sm">
                                    {t('charts.value')}:{' '}
                                    <span className="font-semibold">
                                        {shortNumber(datum.value, 0)}
                                    </span>
                                </div>
                                <div className="text-xs sm:text-sm">
                                    {t('charts.percentage')}:{' '}
                                    <span className="font-semibold">
                                        {datum.data.percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    legends={
                        isMobile
                            ? []
                            : [
                                  {
                                      anchor: 'bottom',
                                      direction: chartConfig.legendDirection,
                                      justify: false,
                                      translateX: 0,
                                      translateY: chartConfig.legendTranslateY,
                                      itemsSpacing: 0,
                                      itemWidth: chartConfig.legendItemWidth,
                                      itemHeight: chartConfig.legendItemHeight,
                                      itemTextColor: 'var(--cx-content)',
                                      itemDirection: 'left-to-right',
                                      itemOpacity: 1,
                                      symbolSize: 18,
                                      symbolShape: 'circle',
                                      effects: [
                                          {
                                              on: 'hover',
                                              style: {
                                                  itemTextColor:
                                                      'var(--cx-content)',
                                              },
                                          },
                                      ],
                                  },
                              ]
                    }
                />
            </div>

            <div className="mt-4 flex flex-col items-center justify-center space-y-3 md:flex-row md:space-y-0 md:space-x-8">
                {pieDataWithPercentages.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-start lg:flex-row lg:items-center"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 flex-shrink-0 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <Paragraph className="text-sm">
                                {item.label}
                            </Paragraph>
                        </div>
                        <div className="flex items-center gap-4 pl-5 sm:pl-0 md:pl-0">
                            <Paragraph className="font-semibold" size="sm">
                                {shortNumber(item.value, 2)}
                            </Paragraph>
                            <Paragraph className="text-content/70 text-sm">
                                {item.percentage}%
                            </Paragraph>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PieChart;
