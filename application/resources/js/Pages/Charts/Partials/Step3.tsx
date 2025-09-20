import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Selector from '@/Components/atoms/Selector';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/useHooks/useUserSettings';
import axios from 'axios';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Step3Props {
    disabled?: boolean;
    onCompletionChange: (isComplete: boolean) => void;
    onNext: () => void;
    onExploreCharts: () => void;
    onChartDataReceived?: (chartData: any) => void;
    onLoadingChange?: (loading: boolean) => void;
    rules: string[];
}

export default function Step3({
    disabled,
    onCompletionChange,
    onNext,
    onExploreCharts,
    onLoadingChange,
    onChartDataReceived,
    rules,
}: Step3Props) {
    const { t } = useLaravelReactI18n();

    const { value: selectedChartOptions, setValue: setSelectedChartOptions } =
        useUserSetting<string[]>(userSettingEnums.CHART_OPTIONS, []);

    const isChartsSelected = useMemo(() => {
        return (selectedChartOptions?.length ?? 0) > 0;
    }, [selectedChartOptions]);

    const { value: selectedChart } = useUserSetting<string>(
        userSettingEnums.CHART_TYPE,
        '',
    );

    const [trendChartDisabled, setTrendChartDisabled] = useState(false);
    const currentParams = new URLSearchParams(window.location.search);
    const paramsObject = Object.fromEntries(currentParams);

    useEffect(() => {
        setTrendChartDisabled(false);
    }, [selectedChart]);

    useEffect(() => {
        onCompletionChange?.(isChartsSelected);
    }, [isChartsSelected, onCompletionChange]);

    const chartOptions = useMemo(() => {
        const isDistributionChart = selectedChart === 'distributionChart';
        const isTrendChart = selectedChart === 'trendChart';

        const allOptions = [
            { label: t('charts.barChart'), value: 'barChart' },
            { label: t('charts.pieChart'), value: 'pieChart' },
            { label: t('charts.lineChart'), value: 'lineChart' },
            { label: t('charts.treeMap'), value: 'treeMap' },
            { label: t('charts.stackedBarChart'), value: 'stackedBarCharts' },
            { label: t('charts.funnelChart'), value: 'funnelChart' },
        ];

        return allOptions.map((option) => {
            let isDisabled = false;

            if (isDistributionChart) {
                isDisabled = [
                    'barChart',
                    'lineChart',
                    'pieChart',
                    'stackedBarCharts',
                    'funnelChart',
                ].includes(option.value);
            } else if (isTrendChart) {
                isDisabled = ['treeMap'].includes(option.value);
            }

            return {
                ...option,
                disabled: isDisabled,
            };
        });
    }, [t, selectedChart]);

    useEffect(() => {
        if (
            selectedChart &&
            selectedChartOptions &&
            selectedChartOptions.length > 0
        ) {
            const isDistributionChart = selectedChart === 'distributionChart';
            const isTrendChart = selectedChart === 'trendChart';

            let disabledOptions: string[] = [];

            if (isDistributionChart) {
                disabledOptions = [
                    'barChart',
                    'lineChart',
                    'pieChart',
                    'stackedBarCharts',
                    'funnelChart',
                ];
            } else if (isTrendChart) {
                disabledOptions = ['treeMap'];
            }

            const filteredSelection = selectedChartOptions.filter(
                (chartType) => !disabledOptions.includes(chartType),
            );

            if (filteredSelection.length !== selectedChartOptions.length) {
                setSelectedChartOptions(filteredSelection);
            }
        }
    }, [selectedChart, selectedChartOptions, setSelectedChartOptions]);

    const selectedItems = useMemo(() => {
        return selectedChartOptions ?? [];
    }, [selectedChartOptions]);

    const handleSelectorChange = useCallback(
        (value: string | string[]) => {
            const selected = Array.isArray(value) ? value : [value];
            setSelectedChartOptions(selected);
        },
        [setSelectedChartOptions],
    );

    const chartType = selectedChart === 'trendChart' ? 'trend' : 'distribution';

    const sendProposalMetrics = useCallback(
        async (rules: Array<string>, chartType: string) => {
            const currentQueryString = window.location.search;
            const urlParams = new URLSearchParams(currentQueryString);

            onLoadingChange?.(true);
            try {
                const response = await axios.get(
                    `${route('api.proposalChartsMetrics')}?${urlParams.toString()}`,
                    {
                        params: { rules, chartType },
                    },
                );
                onChartDataReceived?.(response?.data);
            } catch (error: any) {
                console.error(
                    'Error fetching proposal metrics:',
                    error.response?.data || error.message,
                );
            } finally {
                onLoadingChange?.(false);
            }
        },
        [onLoadingChange, onChartDataReceived],
    );

    const handleComplete = useCallback(() => {
        sendProposalMetrics(rules ?? [], chartType ?? '');
        onCompletionChange(true);
        onNext();
        onExploreCharts();
    }, [
        sendProposalMetrics,
        rules,
        onCompletionChange,
        onNext,
        onExploreCharts,
    ]);

    const buttonClassName = useMemo(() => {
        return `mt-4 w-full ${!isChartsSelected || disabled ? 'cursor-not-allowed opacity-50' : ''}`;
    }, [isChartsSelected, disabled]);

    return (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <Paragraph className="mb-4">
                {t('charts.selectChartType')}
            </Paragraph>
            <div>
                <Selector
                    isMultiselect={true}
                    options={chartOptions}
                    selectedItems={selectedItems}
                    setSelectedItems={handleSelectorChange}
                    disabled={trendChartDisabled}
                    data-testid="chart-style-selector"
                />
            </div>
            <PrimaryButton
                className={buttonClassName}
                disabled={!isChartsSelected}
                onClick={handleComplete}
                data-testid="view-charts-button"
            >
                {t('charts.viewCharts')}
            </PrimaryButton>
        </div>
    );
}
