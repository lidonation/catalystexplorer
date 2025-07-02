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
    chartDataByFund?: any[];
    chartDataByYear?: any[];
}

const Index = ({
                   filters,
                   chartDataByFund,
                   chartDataByYear,
               }: ChartsIndexProps) => {
    const [showCharts, setShowCharts] = useState<boolean>(() => {
        return localStorage.getItem('metricsSet') === 'true';
    });

    const {
        value: viewByPreference,
        setValue: setViewByPreference
    } = useUserSetting<string[]>(
        userSettingEnums.VIEW_CHART_BY,
        ['fund']
    );

    const viewBy: 'fund' | 'year' =
        viewByPreference?.[0] === 'year' ? 'year' : 'fund';
    const chartData = viewBy === 'fund' ? chartDataByFund : chartDataByYear;
    const { url } = usePage();
    const isOnChartsRoute = url.includes('/charts');

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

    const resetChartsState = () => {
        setShowCharts(false);
        localStorage.removeItem('metricsSet');
    };

    useEffect(() => {
        const handleNavigation = () => {
            resetChartsState();
        };

        const handleBeforeUnload = () => {
            resetChartsState();
        };

        const removeNavigationListener = router.on('navigate', handleNavigation);

        window.addEventListener('beforeunload', handleBeforeUnload);

        if(!isOnChartsRoute) {
            resetChartsState();
        }

        return () => {
            removeNavigationListener();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isOnChartsRoute]);

    return (
        <FiltersProvider defaultFilters={filters}>
            <RoutedModalLayout navigate={true} className="md:px-8 px-2" zIndex="z-30">
                <Head title="Charts" />

                {!showCharts && (
                    <div className="flex h-screen w-full flex-col items-center justify-center">
                        <SetChartMetrics
                            onExploreCharts={handleExploreCharts}
                        />
                    </div>
                )}

                {showCharts && (
                    <div>
                        <AllCharts
                            chartData={chartData}
                            onEditMetrics={handleEditMetrics}
                            viewBy={viewBy}
                            onViewByChange={handleViewByChange}
                        />
                    </div>
                )}
            </RoutedModalLayout>
        </FiltersProvider>
    );
};

export default Index;