import Paragraph from '@/Components/atoms/Paragraph';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveFunnel } from '@nivo/funnel';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FunnelChartProps {
    chartData: any;
    viewBy?: 'fund' | 'year';
}

const FunnelChart: React.FC<FunnelChartProps> = ({ chartData, viewBy }) => {
    const { t } = useTranslation();
    const { getFilter } = useFilterContext();
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const [normalizedData, setNormalizedData] = useState<any[]>([]);

    useEffect(() => {
        if (!chartData || chartData.length === 0) {
            setNormalizedData([]);
            return;
        }

        const isSubmittedProposalsFormat =
            Array.isArray(chartData) &&
            chartData?.length > 0 &&
            typeof chartData[0] === 'object' &&
            !chartData[0]?.hasOwnProperty('fund') &&
            !chartData[0]?.hasOwnProperty('year');

        if (isSubmittedProposalsFormat) {
            const fundKeys = Object.keys(chartData[0] || {});
            const normalized = fundKeys?.map((fundKey, index) => ({
                fund: fundKey,
                year: fundKey,
                totalProposals: chartData[0]?.[fundKey] || 0,
            }));
            setNormalizedData(normalized);
        } else {
            const normalized = chartData?.map((item: any) => ({
                ...item,
                totalProposals:
                    item?.totalProposals || 0
            }));
            setNormalizedData(normalized);
        }
    }, [chartData]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const allKeys = [
        {
            key: 'totalProposals',
            label: t('proposals.totalProposals'),
            color: '#4fadce',
            filterParam: ParamsEnum.SUBMITTED_PROPOSALS,
        },
        {
            key: 'fundedProposals',
            label: t('funds.fundedProposals'),
            color: '#ee8434',
            filterParam: ParamsEnum.APPROVED_PROPOSALS,
        },
        {
            key: 'completedProposals',
            label: t('funds.completedProposals'),
            color: '#16B364',
            filterParam: ParamsEnum.COMPLETED_PROPOSALS,
        },
         {
            key: 'inProgressProposals',
            label: t('funds.inProgressProposals'),
            color: '#ee8434',
            filterParam: ParamsEnum.IN_PROGRESS,
        },
        {
            key: 'unfundedProposals',
            label: t('charts.unfundedProposals'),
            color: '#4fadce',
            filterParam: ParamsEnum.UNFUNDED_PROPOSALS,
        },
    ];

    const getFilteredKeys = () => {
        if (!chartData || chartData.length === 0) return [];

        return allKeys.filter((keyItem) => {
            const filterValue = getFilter(keyItem.filterParam);
            const isFilterActive = filterValue && filterValue.length > 0;

            return isFilterActive;
        });
    };

    const activeKeys = getFilteredKeys();

    let total = 0;

    const getFunnelData = () => {
        if (!normalizedData || normalizedData.length === 0) return [];

        const allData = normalizedData?.reduce(
            (acc, item) => {
                allKeys.forEach((key) => {
                    if (!acc[key.key]) {
                        acc[key.key] = 0;
                    }
                    acc[key.key] += item[key.key] || 0;
                });
                return acc;
            },
            {} as Record<string, number>,
        );

     
        const totalProposals = allData?.totalProposals || 0;
        const fundedProposals = allData?.fundedProposals || 0;
        const completedProposals = allData?.completedProposals || 0;
        const inProgressProposals = allData?.inProgressProposals || 0;
        const unfundedProposals = allData?.unfundedProposals;


        const funnelSteps = [];

        if (totalProposals > 0) {
            funnelSteps.push({
                id: 'totalProposals',
                value: totalProposals,
                label: t('charts.totalProposals'),
            });
        }

        if (unfundedProposals > 0) {
            funnelSteps.push({
                id: 'unfundedProposals',
                value: unfundedProposals,
                label: t('charts.unfundedProposals'),
            });
        }

        if (fundedProposals > 0) {
            funnelSteps.push({
                id: 'fundedProposals',
                value: fundedProposals,
                label: t('funds.fundedProposals'),
            });
        }
        
        if (inProgressProposals > 0) {
            funnelSteps.push({
                id: 'inProgressProposals',
                value: inProgressProposals,
                label: t('funds.inProgressProposals'),
            });
        }

        if (completedProposals > 0) {
            funnelSteps.push({
                id: 'completedProposals',
                value: completedProposals,
                label: t('funds.completedProposals'),
            });
        }

        // Sort funnel steps in descending order
        return funnelSteps.sort((a, b) => b.value - a.value);
    };

    const funnelData = getFunnelData() ?? [];


    const getResponsiveConfig = () => {
        const isSmall = screenWidth < 480;
        const isMedium = screenWidth < 768;

        return {
            height: '500px',
            minHeight: isSmall ? '400px' : '500px',
            margin: {
                top: 20,
                right: isSmall ? 20 : isMedium ? 30 : 50,
                bottom: isSmall ? 100 : isMedium ? 80 : 60,
                left: isSmall ? 20 : isMedium ? 30 : 50,
            },
            fontSize: {
                label: isSmall ? 12 : isMedium ? 14 : 16,
                value: isSmall ? 14 : isMedium ? 16 : 18,
            },
        };
    };

    const config = getResponsiveConfig();

    const getColorForStep = (stepId: string) => {
        const keyItem = allKeys.find((key) => key.key === stepId);
        return keyItem ? keyItem.color : '#4fadce';
    };

    if (!funnelData || funnelData.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Paragraph size="md" className="text-content-light">
                    {t('charts.noDataAvailable')}
                </Paragraph>
            </div>
        );
    }
    
    if (funnelData.length < 1) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Paragraph size="md" className="text-content-light">
                    {t('charts.insufficientDataForFunnel')}
                </Paragraph>
            </div>
        );
    }

    return (
        <div>
            <div
                style={{
                    height: config.height,
                    minHeight: config.minHeight,
                }}
                className="min-w-[600px] sm:min-w-full"
            >
                <ResponsiveFunnel
                    data={funnelData}
                    margin={config.margin}
                    valueFormat=" >-0,~"
                    colors={({ id }) => getColorForStep(id)}
                    borderWidth={2}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.3]],
                    }}
                    labelColor={{
                        from: 'color',
                        modifiers: [['darker', 3]],
                    }}
                    beforeSeparatorLength={100}
                    beforeSeparatorOffset={20}
                    afterSeparatorLength={100}
                    afterSeparatorOffset={20}
                    currentPartSizeExtension={10}
                    currentBorderWidth={40}
                    motionConfig="gentle"
                    theme={{
                        labels: {
                            text: {
                                fill: 'var(--cx-content)',
                                fontSize: config.fontSize.label,
                                fontWeight: 'bold',
                            },
                        },
                        tooltip: {
                            container: {
                                background: 'var(--cx-tooltip-bg)',
                                color: 'var(--cx-content-light)',
                                fontSize: config.fontSize.value,
                            },
                        },
                    }}
                    tooltip={({ part }) => {
                        

                        return (
                            <div
                                className={`bg-tooltip text-content-light rounded-xs p-${isMobile ? '2' : '4'} max-w-xs`}
                            >
                                <Paragraph size="sm">
                                    <strong className="mb-1 block">
                                        {part.data.label}
                                    </strong>
                                    <span>
                                        {t('proposals.count')}:{' '}
                                        {shortNumber(part.data.value, 2)}
                                    </span>
                                </Paragraph>
                               
                            </div>
                        );
                    }}
                />
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4">
                {allKeys
                    .filter((keyItem) =>
                        activeKeys.find((active) => active.key === keyItem.key),
                    )
                    .map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                            <div
                                className="h-4 w-10 rounded-md"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-content text-sm font-medium">
                                {item.label}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default FunnelChart;
