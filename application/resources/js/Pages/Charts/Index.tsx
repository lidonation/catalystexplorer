import { FiltersProvider } from '@/Context/FiltersContext';
import ModalLayout from '@/Layouts/ModalLayout';
import { SearchParams } from '@/types/search-params';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AllCharts from './Partials/AllCharts';
import SetChartMetrics from './Partials/SetChartMetrics';
import { userSettingEnums } from '@/enums/user-setting-enums';
import { useUserSetting } from '@/Hooks/useUserSettings';

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

    const viewBy: 'fund' | 'year' = viewByPreference?.[0] === 'year' ? 'year' : 'fund';
    const chartData = viewBy === 'fund' ? chartDataByFund : chartDataByYear;

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
            localStorage.removeItem('metricsSet');
        };

        router.on('navigate', handleNavigation);

    }, []);

    return (
        <FiltersProvider defaultFilters={filters}>
            <ModalLayout navigate={true} className="md:px-8 px-2" zIndex="z-30">
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
            </ModalLayout>
        </FiltersProvider>
    );
};

export default Index;
