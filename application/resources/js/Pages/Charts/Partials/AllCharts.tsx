import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import RadioSelector from '@/Components/atoms/RadioSelector';
import Title from '@/Components/atoms/Title';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import BarChart from './BarChart';
import ChartCard from './ChartCard';
import Heatmap from './HeatMap';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ScatterPlot from './ScatterPlots';
import StackedBarChart from './StackedBarChart';

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
            <ChartCard title={t('charts.barChart')}>
                <BarChart chartData={chartData} />
            </ChartCard>
        </div>
    );

    const renderPieChart = () => (
        <div>
            <ChartCard title={t('charts.pieChart')}>
                <PieChart chartData={chartData} />
            </ChartCard>
        </div>
    );

    const renderLineChart = () => (
        <div>
            <ChartCard title={t('charts.lineChart')}>
                <LineChart chartData={chartData} />
            </ChartCard>
        </div>
    );

    const renderHeatMap = () => (
        <div>
            <ChartCard title={t('charts.heatMap')}>
                <Heatmap chartData={chartData} />
            </ChartCard>
        </div>
    );

    const renderScatterPlots = () => (
        <div>
            <ChartCard title={t('charts.scatterPlot')}>
                <ScatterPlot chartData={chartData} />
            </ChartCard>
        </div>
    );

    const renderStackedBarCharts = () => (
        <div>
            <ChartCard title={t('charts.stackedBarChart')}>
                <StackedBarChart chartData={chartData} />
            </ChartCard>
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
        <div className="relative min-h-screen pb-20 px-6">
            <div className="my-4 flex flex-col items-start justify-between md:flex-row md:items-center">
                <Title level="2" className="mb-4 font-bold">
                    {t('charts.viewCharts')}
                </Title>
                <div className="flex items-center gap-2">
                    <Paragraph className="text-gray-persist">
                        {t('charts.viewBy')}
                    </Paragraph>
                    <RadioSelector
                        options={[
                            { label: t('charts.fund'), value: 'fund' },
                            { label: t('charts.year'), value: 'year' },
                        ]}
                        selectedItem={selectedItem}
                        setSelectedItem={setSelectedItem}
                        className='focus:border-primary focus:ring-primary'
                    />
                </div>
            </div>

            <div className="mb-4 flex md:justify-end justify-start">
                <PrimaryButton onClick={onEditMetrics} className="px-6 py-3">
                    {t('charts.edit')}
                </PrimaryButton>
            </div>

            {selectedChartOptions.length === 0 ? (
                <div className="text-content-light p-8 text-left">
                    <Paragraph>{t('charts.noOptions')}</Paragraph>
                </div>
            ) : (
                <div className="space-y-6">
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
        </div>
    );
}