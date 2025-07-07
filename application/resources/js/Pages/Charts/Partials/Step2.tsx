import Paragraph from '@/Components/atoms/Paragraph';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Step2Props {
    disabled?: boolean;
    onCompletionChange?: (isChartSelected: boolean) => void;
}

export default function Step2({
    disabled = false,
    onCompletionChange,
}: Step2Props) {
    const { t } = useTranslation();
    const { setFilters } = useFilterContext();

    const {
        value: selectedChart,
        setValue: setSelectedChart,
    } = useUserSetting<string>(userSettingEnums.CHART_TYPE, '');

    
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

    const chartOptions = useMemo(() => [
        { label: 'Trend Chart', value: 'trendChart' },
        { label: 'Distribution Chart', value: 'distributionChart' }
    ], []);

    const selectedItems = useMemo(() => {
        return selectedChart ? [selectedChart] : [];
    }, [selectedChart]);

    const handleSelectorChange = useCallback((value: string | string[]) => {
        const chart = Array.isArray(value) ? value[0] : value;
        
        setSelectedChart(chart);
        
        if (chart) {
            setFilters({
                label: t('charts.trendChart'),
                value: chart,
                param: ParamsEnum.CHART_TYPE,
            });
        }
    }, [setSelectedChart, setFilters, t]);

    return (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <Paragraph className="mb-4">
                {t('charts.selectChartType')}
            </Paragraph>
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