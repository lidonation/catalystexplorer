import { FiltersProvider } from '@/Context/FiltersContext';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';
import RoutedModalLayout from '@/Layouts/RoutedModalLayout.tsx';
import { SearchParams } from '@/types/search-params';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AllCharts from './Partials/AllCharts';
import SetChartMetrics from './Partials/SetChartMetrics';

interface ChartsIndexProps {
    filters: SearchParams;
    rules?: string[];
}

const Index = ({
    filters,
    rules
}: ChartsIndexProps) => {
    const [showCharts, setShowCharts] = useState<boolean>(() => {
        return localStorage.getItem('metricsSet') === 'true';
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

    const handleEditMetrics = () => {
        setShowCharts(false);
        localStorage.removeItem('metricsSet');
    };

    const handleViewByChange = (value: string | null) => {
        const newValue = value as 'fund' | 'year';
        setViewByPreference([newValue]);
    };

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
    }

    const filteredAllChartData = allChartData?.find(
        (group) => group?.[0]?.count_by === viewBy,
    );
    

    return (
        <FiltersProvider defaultFilters={filters}>
                <Head title="Charts" />

                {!showCharts && (
                    <div className="flex h-screen w-full flex-col items-center justify-center">
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
                            onEditMetrics={handleEditMetrics}
                            viewBy={viewBy}
                            onViewByChange={handleViewByChange}
                            loading={loading}
                        />
                    </div>
                )}
        </FiltersProvider>
    );
};

export default Index;