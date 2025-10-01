import { FiltersProvider } from '@/Context/FiltersContext';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/useHooks/useUserSettings';
import { SearchParams } from '@/types/search-params';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import AllCharts from './Partials/AllCharts';
import SetChartMetrics from './Partials/SetChartMetrics';

interface ChartsIndexProps {
    filters: SearchParams;
    rules?: string[];
}

const Index = ({ filters, rules }: ChartsIndexProps) => {
    const [showCharts, setShowCharts] = useState<boolean>(() => {
        // Check if both ct and co URL parameters are present to auto-skip metrics setup
        const urlParams = new URLSearchParams(window.location.search);
        const hasCtParam = !!urlParams.get('ct');
        const hasCoParam = !!urlParams.get('co');
        
        // Auto-skip metrics setup if both URL params are present, otherwise check localStorage
        return (hasCtParam && hasCoParam) || localStorage.getItem('metricsSet') === 'true';
    });

    const { value: viewByPreference, setValue: setViewByPreference } =
        useUserSetting<string[]>(userSettingEnums.VIEW_CHART_BY, ['fund']);

    const viewBy: 'fund' | 'year' =
        viewByPreference?.[0] === 'year' ? 'year' : 'fund';
    const [allChartData, setAllChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleExploreCharts = () => {
        setShowCharts(true);
        localStorage.setItem('metricsSet', 'true');
    };


    const handleViewByChange = (value: string | null) => {
        const newValue = value as 'fund' | 'year';
        setViewByPreference([newValue]);
    };

    useEffect(() => {
        // Check URL parameters on mount to auto-skip metrics if both ct and co are present
        const urlParams = new URLSearchParams(window.location.search);
        const hasCtParam = !!urlParams.get('ct');
        const hasCoParam = !!urlParams.get('co');
        
        if (hasCtParam && hasCoParam && !showCharts) {
            setShowCharts(true);
            localStorage.setItem('metricsSet', 'true');
        }
    }, [showCharts]);

    useEffect(() => {
        const handleNavigation = () => {
            if (!window.location.pathname.includes('/charts')) {
                localStorage.removeItem('metricsSet');
            }
        };

        const handleUnload = () => {
            localStorage.removeItem('metricsSet');
        };

        router.on('navigate', handleNavigation);

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);

    const handleChartDataFromMetrics = (chartData: any) => {
        setAllChartData(chartData);
    };

    const handleLoadingChange = (loading: boolean) => {
        setLoading(loading);
    };

    // Function to fetch chart data automatically when URL params are present
    const fetchChartDataFromUrl = useCallback(
        async (rules: Array<string>, chartType: string) => {
            const currentQueryString = window.location.search;
            const urlParams = new URLSearchParams(currentQueryString);

            setLoading(true);
            try {
                const response = await axios.get(
                    `${route('api.proposalChartsMetrics')}?${urlParams.toString()}`,
                    {
                        params: { rules, chartType },
                    },
                );
                setAllChartData(response?.data);
            } catch (error: any) {
                console.error(
                    'Error fetching proposal metrics:',
                    error.response?.data || error.message,
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    // Fetch chart data automatically when both URL parameters are present and charts are shown
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ctParam = urlParams.get('ct');
        const coParam = urlParams.get('co');
        
        if (showCharts && ctParam && coParam && allChartData.length === 0) {
            const chartType = ctParam === 'trendChart' ? 'trend' : 'distribution';
            fetchChartDataFromUrl(rules ?? [], chartType);
        }
    }, [showCharts, allChartData.length, fetchChartDataFromUrl, rules]);

    // Flatten the nested array structure and filter by viewBy
    const flattedChartData = allChartData?.flat() || [];
    
    const filteredAllChartData = flattedChartData.filter(
        (item) => item?.count_by === viewBy && item?.data && item.data.length > 0
    );

    return (
        <FiltersProvider defaultFilters={filters}>
            <Head title="Charts" />

            {!showCharts && (
                <div className="my-10 flex w-full flex-col items-center justify-center md:my-0 md:h-screen">
                    <SetChartMetrics
                        onExploreCharts={handleExploreCharts}
                        onChartDataReceived={handleChartDataFromMetrics}
                        onLoadingChange={handleLoadingChange}
                    />
                </div>
            )}

            {showCharts && (
                <div>
                    <AllCharts
                        chartData={filteredAllChartData}
                        viewBy={viewBy}
                        onViewByChange={handleViewByChange}
                        loading={loading}
                        onChartDataReceived={handleChartDataFromMetrics}
                        onLoadingChange={handleLoadingChange}
                    />
                </div>
            )}
        </FiltersProvider>
    );
};

export default Index;
