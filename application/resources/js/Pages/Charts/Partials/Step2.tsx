import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useEffect } from 'react';
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
    const { setFilters, getFilter } = useFilterContext();
    
    const hasSelections = () => {
        const trendChart = getFilter(ParamsEnum.TREND_CHART) || [];
        return Array.isArray(trendChart) ? trendChart.length > 0 : !!trendChart;
    };

    const isChartSelected = hasSelections();

    useEffect(() => {
        onCompletionChange?.(isChartSelected);
    }, [isChartSelected, onCompletionChange]);

    return (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <Paragraph className="mb-4">
                {t('charts.selectChartType')}
            </Paragraph>
            <div>
                <Selector
                    isMultiselect={false}
                    options={[{ label: 'Trend Chart', value: 'trendChart' }]}
                    setSelectedItems={(value) =>
                        setFilters({
                            label: t('charts.trendChart'),
                            value,
                            param: ParamsEnum.TREND_CHART,
                        })
                    }
                    selectedItems={getFilter(ParamsEnum.TREND_CHART)}
                />
            </div>
        </div>
    );
}