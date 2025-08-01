import ActiveFilters from '@/Components/atoms/ActiveFilters/ActiveFilters';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import RadioSelector from '@/Components/atoms/RadioSelector';
import Title from '@/Components/atoms/Title';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { Share2Icon } from 'lucide-react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import BarChart from './BarChart';
import ChartCard from './ChartCard';
import FunnelChart from './FunnelChart';
import Heatmap from './HeatMap';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ScatterPlot from './ScatterPlots';
import StackedBarChart from './StackedBarChart';

interface AllChartsProps {
    chartData: any;
    onEditMetrics: () => void;
    viewBy: 'fund' | 'year';
    onViewByChange: (value: string | null) => void;
}

export default function AllCharts({
    chartData,
    onEditMetrics,
    viewBy,
    onViewByChange,
}: AllChartsProps) {
    const { getFilter, filters, setFilters } = useFilterContext();
    const selectedChartOptions = getFilter(ParamsEnum.CHART_OPTIONS) || [];
    const { t } = useLaravelReactI18n();
    const hasSubmittedProposals =
        (getFilter(ParamsEnum.SUBMITTED_PROPOSALS) || []).length > 0;
    const hasApprovedProposals =
        (getFilter(ParamsEnum.APPROVED_PROPOSALS) || []).length > 0;
    const hasCompletedProposals =
        (getFilter(ParamsEnum.COMPLETED_PROPOSALS) || []).length > 0;
    const hasUnfundedProposals =
        (getFilter(ParamsEnum.UNFUNDED_PROPOSALS) || []).length > 0;
    const hasInProgressProposals =
        (getFilter(ParamsEnum.IN_PROGRESS) || []).length > 0;

    const hasAnyProposalTypeSelected =
        hasSubmittedProposals ||
        hasApprovedProposals ||
        hasCompletedProposals ||
        hasUnfundedProposals ||
        hasInProgressProposals;

    const renderBarChart = () => (
        <div>
            <ChartCard title={t('charts.barChart')}>
                <BarChart chartData={chartData} viewBy={viewBy} />
            </ChartCard>
        </div>
    );

    const renderPieChart = () => (
        <div>
            <ChartCard title={t('charts.pieChart')}>
                <PieChart chartData={chartData} viewBy={viewBy} />
            </ChartCard>
        </div>
    );

    const renderLineChart = () => (
        <div className="bg-background flex w-full flex-col overflow-x-auto rounded-lg p-4 shadow-md md:overflow-visible">
            <div className="mb-4 flex items-center justify-between">
                <Title level="4" className="font-semibold">
                    {t('charts.lineChart')}
                </Title>
                <div className="text-primary flex items-center gap-2">
                    <Paragraph>{t('charts.share')}</Paragraph>
                    <Share2Icon />
                </div>
            </div>
            <LineChart chartData={chartData} viewBy={viewBy} />
        </div>
    );

    const renderHeatMap = () => (
        <div>
            <ChartCard title={t('charts.heatMap')}>
                <Heatmap chartData={chartData} viewBy={viewBy} />
            </ChartCard>
        </div>
    );

    const renderScatterPlots = () => (
        <div>
            <ChartCard title={t('charts.scatterPlot')}>
                <ScatterPlot chartData={chartData} viewBy={viewBy} />
            </ChartCard>
        </div>
    );

    const renderStackedBarCharts = () => (
        <div>
            <ChartCard title={t('charts.stackedBarChart')}>
                <StackedBarChart chartData={chartData} viewBy={viewBy} />
            </ChartCard>
        </div>
    );

    const renderFunnelChart = () => (
        <div>
            <ChartCard title={t('charts.funnelChart')}>
                <FunnelChart chartData={chartData} viewBy={viewBy} />
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
        funnelChart: renderFunnelChart,
    };

    return (
        <div className="relative min-h-screen px-6 pb-20">
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
                        selectedItem={viewBy}
                        setSelectedItem={onViewByChange}
                        className="focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            <div className="mb-4 flex justify-start md:justify-between">
                <div className="container mx-auto flex justify-start px-0">
                    <ActiveFilters
                        filters={filters}
                        setFilters={setFilters}
                    />
                </div>
                <div>
                    <PrimaryButton
                        onClick={onEditMetrics}
                        className="px-6 py-3"
                    >
                        {t('charts.edit')}
                    </PrimaryButton>
                </div>
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
                            <div key={chartType}>
                                {hasAnyProposalTypeSelected ? (
                                    renderer()
                                ) : (
                                    <div>
                                        <ChartCard
                                            title={t(`charts.${chartType}`)}
                                        >
                                            <div className="p-8 text-center">
                                                <Paragraph
                                                    className="text-content-light mb-4"
                                                    size="lg"
                                                >
                                                    {t(
                                                        'charts.selectProposalTypesFirst',
                                                    )}
                                                </Paragraph>
                                            </div>
                                        </ChartCard>
                                    </div>
                                )}
                            </div>
                        ) : null;
                    })}
                </div>
            )}
        </div>
    );
}
