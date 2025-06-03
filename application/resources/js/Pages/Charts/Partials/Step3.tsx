import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Step3Props {
    disabled?: boolean;
    onCompletionChange: (isComplete: boolean) => void;
    onNext: () => void;
    onExploreCharts: () => void; // ✅ New prop
}

export default function Step3({
    disabled,
    onCompletionChange,
    onNext,
    onExploreCharts,
}: Step3Props) {
    const { t } = useTranslation();
    const { setFilters, getFilter } = useFilterContext();
    const hasSelections = () => {
            const chartOptions = getFilter(ParamsEnum.TREND_CHART) || [];
            return chartOptions.length > 0;
        };

    const isChartsSelected = hasSelections();

    useEffect(() => {
        onCompletionChange?.(isChartsSelected);
    }, [isChartsSelected, onCompletionChange]);

    const handleComplete = () => {
        onCompletionChange(true);
        onNext();
        onExploreCharts(); // ✅ Immediately show charts
    };

    const chartOptions = [
        { label: t('charts.barChart'), value: 'barChart' },
        { label: t('charts.pieChart'), value: 'pieChart' },
        { label: t('charts.lineChart'), value: 'lineChart' },
        { label: t('charts.heatMap'), value: 'heatMap' },
        { label: t('charts.scatterPlot'), value: 'scatterPlots' },
        { label: t('charts.stackedBarChart'), value: 'stackedBarCharts' },
    ]

    return (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <Paragraph className="mb-4">
                {t('charts.selectChartType')}
            </Paragraph>
            <div>
                <Selector
                    isMultiselect={true}
                    options={chartOptions}
                    setSelectedItems={(value) =>
                        setFilters({
                            label: t('charts.chartOptions'),
                            value,
                            param: ParamsEnum.CHART_OPTIONS,
                        })
                    }
                    selectedItems={getFilter(ParamsEnum.CHART_OPTIONS)}
                />
            </div>
            <PrimaryButton
                className={`mt-4 w-full ${!isChartsSelected ? 'cursor-not-allowed opacity-50' : ''}`}
                disabled={!isChartsSelected}
                onClick={() => handleComplete()}
            >
                {t('charts.exploreCharts')}
            </PrimaryButton>
        </div>
    );
}
