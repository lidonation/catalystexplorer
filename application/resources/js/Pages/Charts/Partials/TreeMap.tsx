import Paragraph from '@/Components/atoms/Paragraph';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { ResponsiveTreeMap } from '@nivo/treemap';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useState } from 'react';

interface TreeMapProps {
    chartData: any;
    viewBy?: 'fund' | 'year';
}

const TreeMap: React.FC<TreeMapProps> = ({ chartData, viewBy }) => {
    const { t } = useLaravelReactI18n();
    const { value: proposalTypes } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_TYPE,
        [],
    );
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    const [normalizedData, setNormalizedData] = useState<any>({});

    const allKeys = [
        {
            key: 'Submitted Proposals',
            label: t('proposals.totalProposals'),
            color: '#4fadce',
            proposalType: 'submitted',
        },
        {
            key: 'Funded Proposals',
            label: t('funds.fundedProposals'),
            color: '#ee8434',
            proposalType: 'approved',
        },
        {
            key: 'Completed Proposals',
            label: t('funds.completedProposals'),
            color: '#16B364',
            proposalType: 'complete',
        },
        {
            key: 'In Progress Proposals',
            label: t('funds.inProgressProposals'),
            color: '#f59e0b',
            proposalType: 'in_progress',
        },
        {
            key: 'Unfunded Proposals',
            label: t('charts.unfundedProposals'),
            color: '#ef4444',
            proposalType: 'unfunded',
        },
    ];

    const getFilteredKeys = () => {
        if (!chartData || chartData?.length === 0) return [];

        return allKeys.filter((keyItem) => {
            const isActive =
                proposalTypes?.includes(keyItem.proposalType) || false;
            return isActive;
        });
    };

    const activeKeys = getFilteredKeys();

    const colorMap = allKeys.reduce(
        (map, item) => {
            map[item.key] = item.color;
            return map;
        },
        {} as Record<string, string>,
    );

    useEffect(() => {
        if (!Array.isArray(chartData) || chartData?.length === 0) return;

        const transformed = {
            name: 'Proposals',
            children: chartData.map((group: any) => ({
                name: group.id,
                children: group.data
                    .filter((item: any) => Array.isArray(item.tags))
                    .map((item: any) => ({
                        name: item.count_by,
                        children: item.tags.map((tag: any) => ({
                            name: tag.title,
                            value: tag.tagCount,
                            color: colorMap[group.id] || '#ccc',
                            category: group.id,
                        })),
                    })),
            })),
        };
        
        setNormalizedData(transformed);
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

    const getResponsiveConfig = () => {
        const isSmall = screenWidth < 480;
        const isMedium = screenWidth < 768;

        return {
            height: isSmall ? '400px' : isMedium ? '500px' : '1600px',
            margin: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
            },
            labelSize: isSmall ? 10 : isMedium ? 12 : 14,
            fontSize: {
                tooltip: isSmall ? 10 : isMedium ? 12 : 14,
            },
        };
    };

    const config = getResponsiveConfig();

    return (
        <div>
            <div
                style={{
                    height: config.height,
                }}
                className="min-w-[600px] sm:min-w-full"
            >
                <ResponsiveTreeMap
                    data={normalizedData}
                    identity="name"
                    value="value"
                    valueFormat=".02s"
                    margin={config.margin}
                    labelSkipSize={35}
                    labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 1.2]],
                    }}
                    label={(node) => {
                        const maxLength = isMobile ? 8 : 9;
                        return node?.data?.name?.length > maxLength
                            ? node?.data?.name?.substring(0, maxLength) + '...'
                            : node?.data?.name;
                    }}
                    parentLabelPosition="top"
                    parentLabelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 2]],
                    }}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 0.1]],
                    }}
                    colors={(node: any) => {
                        return node.data.color || '#ccc';
                    }}
                    nodeOpacity={0.85}
                    animate={true}
                    motionConfig="gentle"
                    tooltip={(node: any) => (
                        <div
                            className={`bg-tooltip text-content-light rounded-xs p-${isMobile ? '2' : '4'} w-fit border shadow-lg`}
                        >
                            <Paragraph size="sm">
                                <strong className="mb-1 block">
                                    {node.node.data.name}
                                </strong>
                            </Paragraph>
                            <Paragraph size={isMobile ? 'xs' : 'sm'}>
                                Count: {node.node.value}
                            </Paragraph>
                        </div>
                    )}
                    theme={{
                        labels: {
                            text: {
                                fill: 'var(--cx-content)',
                                fontSize: config.labelSize,
                                fontWeight: 'bold',
                            },
                        },
                        tooltip: {
                            container: {
                                fontSize: config.fontSize.tooltip,
                            },
                        },
                    }}
                    parentLabelPadding={isMobile ? 6 : 10}
                />
            </div>

            {/* Legend */}
            <div className="mt-4">
                <div
                    className={`flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} justify-center gap-4`}
                >
                    {activeKeys.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded"
                                style={{ backgroundColor: item.color }}
                            />
                            <Paragraph size={isMobile ? 'xs' : 'sm'}>
                                {item.label}
                            </Paragraph>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TreeMap;
