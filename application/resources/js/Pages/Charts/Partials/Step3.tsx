import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Selector from '@/Components/atoms/Selector';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Step3Props {
    disabled?: boolean;
    onCompletionChange: (isComplete: boolean) => void;
    onNext: () => void;
    onExploreCharts: () => void;
}

export default function Step3({
    disabled,
    onCompletionChange,
    onNext,
    onExploreCharts,
}: Step3Props) {
    const { t } = useTranslation();
    const { setFilters } = useFilterContext();

    const {
        value: selectedChartTypes,
        setValue: setSelectedChartTypes,
    } = useUserSetting<string[]>(userSettingEnums.CHART_OPTIONS, []);

    
    const isChartsSelected = useMemo(() => {
        return (selectedChartTypes?.length ?? 0) > 0;
    }, [selectedChartTypes]);

     const {
        value: selectedChart,
    } = useUserSetting<string>(userSettingEnums.CHART_TYPE, '');

    const [trendChartDisabled, setTrendChartDisabled] = useState(false);

    useEffect(()=>{
        console.log('Selected Chart', selectedChart)
    }, [selectedChart])

   useEffect(()=>{
     setTrendChartDisabled(false);
   }, [selectedChart]);

    useEffect(() => {
        onCompletionChange?.(isChartsSelected);
    }, [isChartsSelected, onCompletionChange]);

    
    useEffect(() => {
        if (selectedChartTypes && selectedChartTypes.length > 0) {
            setFilters({
                label: t('charts.chartOptions'),
                value: selectedChartTypes,
                param: ParamsEnum.CHART_OPTIONS,
            });
        }
    }, [selectedChartTypes, t, setFilters]);

    
    const chartOptions = useMemo(() => {
        const isDistributionChart = selectedChart === 'distributionChart';
        const isTrendChart = selectedChart === 'trendChart';
        
        const allOptions = [
            { label: t('charts.barChart'), value: 'barChart' },
            { label: t('charts.pieChart'), value: 'pieChart' },
            { label: t('charts.lineChart'), value: 'lineChart' },
            { label: t('charts.heatMap'), value: 'heatMap' },
            { label: t('charts.scatterPlot'), value: 'scatterPlots' },
            { label: t('charts.stackedBarChart'), value: 'stackedBarCharts' },
            { label: t('charts.funnelChart'), value: 'funnelChart' },
        ];

        return allOptions.map(option => {
            let isDisabled = false;
            
            if (isDistributionChart) {
                isDisabled = ['barChart', 'lineChart', 'pieChart', 'stackedBarCharts', 'funnelChart'].includes(option.value);
            } else if (isTrendChart) {
                isDisabled = ['heatMap', 'scatterPlots'].includes(option.value);
            }
            
            return {
                ...option,
                disabled: isDisabled
            };
        });
    }, [t, selectedChart]);

    useEffect(() => {
        if (selectedChart && selectedChartTypes && selectedChartTypes.length > 0) {
            const isDistributionChart = selectedChart === 'distributionChart';
            const isTrendChart = selectedChart === 'trendChart';
            
            let disabledOptions: string[] = [];
            
            if (isDistributionChart) {
                disabledOptions = ['barChart', 'lineChart', 'pieChart', 'stackedBarCharts', 'funnelChart'];
            } else if (isTrendChart) {
                disabledOptions = ['heatMap', 'scatterPlots'];
            }
            
            const filteredSelection = selectedChartTypes.filter(
                chartType => !disabledOptions.includes(chartType)
            );
            
            if (filteredSelection.length !== selectedChartTypes.length) {
                setSelectedChartTypes(filteredSelection);
            }
        }
    }, [selectedChart, selectedChartTypes, setSelectedChartTypes]);

    
    const selectedItems = useMemo(() => {
        return selectedChartTypes ?? [];
    }, [selectedChartTypes]);

  
    const handleSelectorChange = useCallback((value: string | string[]) => {
        const selected = Array.isArray(value) ? value : [value];
        
       
        setSelectedChartTypes(selected);
    
        if (selected.length > 0) {
            setFilters({
                label: t('charts.chartOptions'),
                value: selected,
                param: ParamsEnum.CHART_OPTIONS,
            });
        }
    }, [setSelectedChartTypes, setFilters, t]);

    const handleComplete = useCallback(() => {
        onCompletionChange(true);
        onNext();
        onExploreCharts();
    }, [onCompletionChange, onNext, onExploreCharts]);

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
                />
            </div>
            <PrimaryButton
                className={buttonClassName}
                disabled={!isChartsSelected}
                onClick={handleComplete}
            >
                {t('charts.viewCharts')}
            </PrimaryButton>
        </div>
    );
}