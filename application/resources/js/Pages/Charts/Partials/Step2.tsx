import Paragraph from '@/Components/atoms/Paragraph';
import Selector from '@/Components/atoms/Selector';
import InformationIcon from '@/Components/svgs/InformationIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface Step2Props {
    disabled?: boolean;
    onCompletionChange?: (isChartSelected: boolean) => void;
}

export default function Step2({
    disabled = false,
    onCompletionChange,
}: Step2Props) {
    const { t } = useLaravelReactI18n();
    const { setFilters } = useFilterContext();

    const { value: selectedChart, setValue: setSelectedChart } =
        useUserSetting<string>(userSettingEnums.CHART_TYPE, '');

    const isChartSelected = useMemo(() => {
        return !!selectedChart;
    }, [selectedChart]);

    const chartOptions = useMemo(
        () => [
            { label: t('charts.trendChart'), value: 'trendChart' },
            {
                label: t('charts.distributionChart'),
                value: 'distributionChart',
            },
        ],
        [t],
    );

    const getChartLabel = useCallback(
        (value: string) =>
            chartOptions.find((opt) => opt.value === value)?.label ?? value,
        [chartOptions],
    );

    useEffect(() => {
        onCompletionChange?.(isChartSelected);
    }, [isChartSelected, onCompletionChange]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (selectedChart) {
            setTimeout(() => {
                setFilters({
                    label: getChartLabel(selectedChart),
                    value: selectedChart,
                    param: ParamsEnum.CHART_TYPE,
                });
            }, 0);
        }
    }, [selectedChart, getChartLabel, setFilters, mounted]);

    const selectedItems = useMemo(() => {
        return selectedChart ? [selectedChart] : [];
    }, [selectedChart]);

    const handleSelectorChange = useCallback(
        (value: string | string[]) => {
            if (!mounted) return;

            const chart = Array.isArray(value) ? value[0] : value;
            setSelectedChart(chart);

            if (chart) {
                setFilters({
                    label: getChartLabel(chart),
                    value: chart,
                    param: ParamsEnum.CHART_TYPE,
                });
            }
        },
        [setSelectedChart, setFilters, getChartLabel, mounted],
    );

    return (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <div className="mb-4 flex items-center gap-2">
                <Paragraph>{t('charts.selectChartType')}</Paragraph>
                <div className="flex justify-center">
                    <div className="group relative">
                        <InformationIcon className="mx-auto" />
                        <div className="bg-tooltip absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded p-2 text-white shadow-lg group-hover:block">
                            <Paragraph>{t('charts.chooseChartType')}</Paragraph>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Selector
                    isMultiselect={false}
                    options={chartOptions}
                    selectedItems={selectedItems}
                    setSelectedItems={handleSelectorChange}
                    data-testid="chart-type-selector"
                />
            </div>
        </div>
    );
}
