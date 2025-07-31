import Paragraph from '@/Components/atoms/Paragraph';
import Selector from '@/Components/atoms/Selector';
import InformationIcon from '@/Components/svgs/InformationIcon';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { useCallback, useEffect, useMemo } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

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

    useEffect(() => {
        onCompletionChange?.(isChartSelected);
    }, [isChartSelected, onCompletionChange]);

    useEffect(() => {
        if (selectedChart) {
            setFilters({
                label: t('charts.trendChart'),
                value: selectedChart,
                param: ParamsEnum.TREND_CHART,
            });
        }
    }, [selectedChart, t, setFilters]);

    const chartOptions = useMemo(
        () => [
            { label: 'Trend Chart', value: 'trendChart' },
            { label: 'Distribution Chart', value: 'distributionChart' },
        ],
        [],
    );

    const selectedItems = useMemo(() => {
        return selectedChart ? [selectedChart] : [];
    }, [selectedChart]);

    const handleSelectorChange = useCallback(
        (value: string | string[]) => {
            const chart = Array.isArray(value) ? value[0] : value;

            setSelectedChart(chart);

            if (chart) {
                setFilters({
                    label: t('charts.trendChart'),
                    value: chart,
                    param: ParamsEnum.CHART_TYPE,
                });
            }
        },
        [setSelectedChart, setFilters, t],
    );

    return (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <div className="mb-4 flex items-center gap-2">
                <Paragraph>{t('charts.selectChartType')}</Paragraph>
                <div className="flex justify-center">
                    <div className="group relative">
                        <InformationIcon className="mx-auto" />
                        <div className="bg-tooltip absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded p-2 text-white shadow-lg group-hover:block">
                           <Paragraph> {t('charts.chooseChartType')}</Paragraph>
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
                />
            </div>
        </div>
    );
}
