import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import RadioSelector from '@/Components/atoms/RadioSelector';
import Title from '@/Components/atoms/Title';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useState } from 'react';
import BarChart from './BarChart';
import Heatmap from './HeatMap';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ScatterPlot from './ScatterPlots';
import StackedBarChart from './StackedBarChart';
import { useTranslation } from 'react-i18next';

interface AllChartsProps {
    chartData: any;
    onEditMetrics: () => void;
}

export default function AllCharts({
    chartData,
    onEditMetrics,
}: AllChartsProps) {
    const { getFilter } = useFilterContext();
    const selectedChartOptions = getFilter(ParamsEnum.CHART_OPTIONS) || [];
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const { t } = useTranslation();
    const renderBarChart = () => (
        <div>
            <BarChart chartData={chartData} />
        </div>
    );

    const renderPieChart = () => (
        <div>
            <PieChart chartData={chartData} />
        </div>
    );

    const renderLineChart = () => (
        <div>
            <LineChart chartData={chartData} />
        </div>
    );

    const renderHeatMap = () => (
        <div>
            <Heatmap chartData={chartData} />
        </div>
    );

    const renderScatterPlots = () => (
        <div>
            <ScatterPlot chartData={chartData} />
        </div>
    );

    const renderStackedBarCharts = () => (
        <div>
            <StackedBarChart chartData={chartData} />
        </div>
    );

    const chartRenderers = {
        barChart: renderBarChart,
        pieChart: renderPieChart,
        lineChart: renderLineChart,
        heatMap: renderHeatMap,
        scatterPlots: renderScatterPlots,
        stackedBarCharts: renderStackedBarCharts,
    };

    return (
        <div className="relative min-h-screen pb-20">
            <div className="flex justify-between items-center">
                <Title level="2" className="mb-4 font-bold">
                    {t('charts.exploreCharts')}
                </Title>
                <div className="flex gap-2 items-center justify-center pr-8">
                    <Paragraph>{t('charts.viewBy')}</Paragraph>
                    <RadioSelector
                        options={[
                            { label: t('charts.fund'), value: 'fund' },
                            { label: t('charts.year'), value: 'year' },
                        ]}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                    />
                </div>
            </div>

            {selectedChartOptions.length === 0 ? (
                <div className="p-8 text-center text-content-light">
                   <Paragraph>{t('charts.noOptions')}</Paragraph>
                </div>
            ) : (
                <div className="space-y-6 px-6">
                    {selectedChartOptions.map((chartType: string) => {
                        const renderer =
                            chartRenderers[
                                chartType as keyof typeof chartRenderers
                            ];
                        return renderer ? (
                            <div key={chartType}>{renderer()}</div>
                        ) : null;
                    })}
                </div>
            )}
            <PrimaryButton
                onClick={onEditMetrics}
                className="fixed bottom-6 left-6 z-50  px-6 py-3"
            >
                {t('charts.editMetrics')}
            </PrimaryButton>
        </div>
    );
}
