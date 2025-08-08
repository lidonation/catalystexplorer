import ActiveFilters from '@/Components/atoms/ActiveFilters/ActiveFilters';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import RadioSelector from '@/Components/atoms/RadioSelector';
import Title from '@/Components/atoms/Title';
import { useFilterContext } from '@/Context/FiltersContext';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import { Share2Icon } from 'lucide-react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import BarChart from './BarChart';
import ChartCard from './ChartCard';
import { ChartLoading } from './ChartLoading';
import FunnelChart from './FunnelChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import StackedBarChart from './StackedBarChart';
import TreeMap from './TreeMap';


interface AllChartsProps {
    chartData: any;
    onEditMetrics: () => void;
    viewBy: 'fund' | 'year';
    onViewByChange: (value: string | null) => void;
    loading?: boolean;
}

export default function AllCharts({
    chartData,
    onEditMetrics,
    viewBy,
    onViewByChange,
    loading,
}: AllChartsProps) {
    const { filters, setFilters } = useFilterContext();
    const { value: selectedChartTypes } = useUserSetting<string[]>(
        userSettingEnums.CHART_OPTIONS,
        [],
    );
    const { value: proposalTypes } = useUserSetting<string[]>(
        userSettingEnums.PROPOSAL_TYPE,
        [],
    );
    const { t } = useLaravelReactI18n();
    const hasSubmittedProposals = proposalTypes?.includes('submitted');
    const hasApprovedProposals = proposalTypes?.includes('approved');
    const hasCompletedProposals = proposalTypes?.includes('complete');
    const hasUnfundedProposals = proposalTypes?.includes('unfunded');
    const hasInProgressProposals = proposalTypes?.includes('in_progress');

    const hasAnyProposalTypeSelected =
        hasSubmittedProposals ||
        hasApprovedProposals ||
        hasCompletedProposals ||
        hasUnfundedProposals ||
        hasInProgressProposals;

    const getChartLoadingType = (chartType: string): string => {
        const loadingTypeMap: { [key: string]: string } = {
            barChart: 'bar',
            pieChart: 'pie',
            lineChart: 'line',
            stackedBarCharts: 'stackedbar',
            funnelChart: 'funnel',
            treeMap: 'treemap',
        };
        return loadingTypeMap[chartType] || 'bar';
    };

    const renderBarChart = () =>
        loading ? (
            <ChartLoading chartType="bar" />
        ) : (
            <div>
                <ChartCard title={t('charts.barChart')}>
                    <BarChart chartData={chartData} viewBy={viewBy} />
                </ChartCard>
            </div>
        );

    const renderPieChart = () =>
        loading ? (
            <ChartLoading chartType="pie" />
        ) : (
            <div>
                <ChartCard title={t('charts.pieChart')}>
                    <PieChart chartData={chartData} viewBy={viewBy} />
                </ChartCard>
            </div>
        );

    const renderLineChart = () =>
        loading ? (
            <ChartLoading chartType="line" />
        ) : (
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

    const renderStackedBarCharts = () =>
        loading ? (
            <ChartLoading chartType="stackedbar" />
        ) : (
            <div>
                <ChartCard title={t('charts.stackedBarChart')}>
                    <StackedBarChart chartData={chartData} viewBy={viewBy} />
                </ChartCard>
            </div>
        );

    const renderFunnelChart = () =>
        loading ? (
            <ChartLoading chartType="funnel" />
        ) : (
            <div>
                <ChartCard title={t('charts.funnelChart')}>
                    <FunnelChart chartData={chartData} viewBy={viewBy} />
                </ChartCard>
            </div>
        );

    const renderTreeMap = () =>
        loading ? (
            <ChartLoading chartType="treemap" />
        ) : (
            <div>
                <ChartCard title={t('charts.treeMap')}>
                    <TreeMap chartData={chartData} viewBy={viewBy} />
                </ChartCard>
            </div>
        );

    const chartRenderers = {
        barChart: renderBarChart,
        pieChart: renderPieChart,
        lineChart: renderLineChart,
        stackedBarCharts: renderStackedBarCharts,
        funnelChart: renderFunnelChart,
        treeMap: renderTreeMap,
    };

    return (
        <div className="relative min-h-screen px-6 pb-20">
            <div className="my-4 flex flex-col items-start justify-between md:flex-row md:items-center">
                <Title level="2" className="mb-4 font-bold">
                    {t('charts.viewCharts')}
                </Title>
                <div className="flex items-center justify-between w-full md:w-fit">
                   <div className='flex items-center gap-2'>
                     <Paragraph className="text-content/70">
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
                   <div className='block md:hidden'>
                    <PrimaryButton
                        onClick={onEditMetrics}
                        className="px-6 py-3"
                    >
                        {t('charts.edit')}
                    </PrimaryButton>
                </div>
                </div>
            </div>

            <div className="mb-4 flex justify-start md:justify-between items-start">
                <div className="container mx-auto flex justify-start px-0">
                    <ActiveFilters filters={filters} setFilters={setFilters} />
                </div>
                <div className='hidden md:block'>
                    <PrimaryButton
                        onClick={onEditMetrics}
                        className="px-6 py-3"
                    >
                        {t('charts.edit')}
                    </PrimaryButton>
                </div>
            </div>

            {selectedChartTypes?.length === 0 ? (
                <div className="text-content-light p-8 text-left">
                    <Paragraph>{t('charts.noOptions')}</Paragraph>
                </div>
            ) : (
                <div className="space-y-6">
                    {selectedChartTypes?.map((chartType: string) => {
                        const renderer =
                            chartRenderers[
                                chartType as keyof typeof chartRenderers
                            ];
                        return renderer ? (
                            <div key={chartType}>
                                {loading ? (
                                    <ChartLoading chartType={getChartLoadingType(chartType)} />
                                ) : hasAnyProposalTypeSelected ? (
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