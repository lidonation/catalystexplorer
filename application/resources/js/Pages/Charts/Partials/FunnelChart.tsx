import Paragraph from '@/Components/atoms/Paragraph';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { shortNumber } from '@/utils/shortNumber';
import { ResponsiveFunnel } from '@nivo/funnel';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useState } from 'react';

interface FunnelChartProps {
    chartData: any;
    viewBy?: 'fund' | 'year';
}

const FunnelChart: React.FC<FunnelChartProps> = ({ chartData, viewBy }) => {
    const { t } = useLaravelReactI18n();
    const { getFilter } = useFilterContext();
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const [normalizedData, setNormalizedData] = useState<any[]>([]);

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
            key: 'Submitted Proposals',
            label: t('proposals.totalProposals'),
            color: '#4fadce',
            filterParam: ParamsEnum.SUBMITTED_PROPOSALS,
        },
        {
            key: 'Funded Proposals',
            label: t('funds.fundedProposals'),
            color: '#ee8434',
            filterParam: ParamsEnum.APPROVED_PROPOSALS,
        },
        {
            key: 'Completed Proposals',
            label: t('funds.completedProposals'),
            color: '#16B364',
            filterParam: ParamsEnum.COMPLETED_PROPOSALS,
        },
        {
            key: 'In Progress Proposals',
            label: t('funds.inProgressProposals'),
            color: '#ee8434',
            filterParam: ParamsEnum.IN_PROGRESS,
        },
        {
            key: 'Unfunded Proposals',
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

        const totalProposals = allData?.['Submitted Proposals'] || 0;
        const fundedProposals = allData?.['Funded Proposals'] || 0;
        const completedProposals = allData?.['Completed Proposals'] || 0;
        const inProgressProposals = allData?.['In Progress Proposals'] || 0;
        const unfundedProposals = allData?.['Unfunded Proposals'] || 0;

        const funnelSteps = [];

        if (totalProposals > 0) {
            funnelSteps.push({
                id: 'Submitted Proposals',
                value: totalProposals,
                label: t('charts.totalProposals'),
            });
        }

        if (unfundedProposals > 0) {
            funnelSteps.push({
                id: 'Unfunded Proposals',
                value: unfundedProposals,
                label: t('charts.unfundedProposals'),
            });
        }

        if (fundedProposals > 0) {
            funnelSteps.push({
                id: 'Funded Proposals',
                value: fundedProposals,
                label: t('funds.fundedProposals'),
            });
        }

        if (inProgressProposals > 0) {
            funnelSteps.push({
                id: 'In Progress Proposals',
                value: inProgressProposals,
                label: t('funds.inProgressProposals'),
            });
        }

        if (completedProposals > 0) {
            funnelSteps.push({
                id: 'Completed Proposals',
                value: completedProposals,
                label: t('funds.completedProposals'),
            });
        }

        // Sort funnel steps in descending order
        return funnelSteps.sort((a, b) => b.value - a.value);
    };

    const funnelData = getFunnelData() ?? [];

    useEffect(() => {
        console.log('normalizedData', normalizedData);
        console.log('funnelData', funnelData);
    }, [normalizedData, funnelData]);

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
                                className={`bg-tooltip text-content-light rounded-xs p-${isMobile ? '2' : '4'} w-52`}
                            >
                                <Paragraph size="sm">
                                    <strong className="mb-1 block">
                                        {part.data.label}
                                    </strong>
                                    <span className='font-bold'>
                                        {t('proposals.count')}:{' '}
                                        {shortNumber(part.data.value, 2)}
                                    </span>
                                </Paragraph>
                            </div>
                        );
                    }}
                />
            </div>

            <div className="flex md:flex-wrap flex-col justify-center items-center gap-4 sm:justify-start w-fit mx-auto">
                {funnelData.map((step) => {
                    const keyItem = allKeys.find((k) => k.key === step.id);
                    if (!keyItem) return null;

                    return (
                        <div
                            key={keyItem.key}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="h-3 md:w-8 w-3 rounded-lg"
                                style={{ backgroundColor: keyItem.color }}
                            />
                            <span className="text-content text-base font-bold">
                                {keyItem.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FunnelChart;
