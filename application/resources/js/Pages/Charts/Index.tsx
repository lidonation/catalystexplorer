import { FiltersProvider } from '@/Context/FiltersContext';
import ModalLayout from '@/Layouts/ModalLayout';
import { SearchParams } from '@/types/search-params';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AllCharts from './Partials/AllCharts';
import SetChartMetrics from './Partials/SetChartMetrics';

interface ChartsIndexProps {
    filters: SearchParams;
}

const Index = ({ filters }: ChartsIndexProps) => {
    const [showCharts, setShowCharts] = useState<boolean>(() => {
        return localStorage.getItem('metricsSet') === 'true';
    });

    const handleExploreCharts = () => {
        setShowCharts(true);
        localStorage.setItem('metricsSet', 'true');
    };

    const handleEditMetrics = () => {
        setShowCharts(false);
        localStorage.removeItem('metricsSet');
    };

    useEffect(() => {
        const handleNavigation = () => {
            localStorage.removeItem('metricsSet');
        };

        router.on('navigate', handleNavigation); 
;
    }, []);

    const chartData: any = [
        {
            fund: 'Fund 3',
            totalProposals: 150,
            fundedProposals: 50,
            completedProposals: 40,
        },
        {
            fund: 'Fund 4',
            totalProposals: 300,
            fundedProposals: 100,
            completedProposals: 70,
        },
        {
            fund: 'Fund 5',
            totalProposals: 300,
            fundedProposals: 100,
            completedProposals: 80,
        },
        {
            fund: 'Fund 6',
            totalProposals: 600,
            fundedProposals: 200,
            completedProposals: 100,
        },
        {
            fund: 'Fund 7',
            totalProposals: 823,
            fundedProposals: 525,
            completedProposals: 511,
        },
        {
            fund: 'Fund 8',
            totalProposals: 1000,
            fundedProposals: 400,
            completedProposals: 200,
        },
        {
            fund: 'Fund 9',
            totalProposals: 1100,
            fundedProposals: 300,
            completedProposals: 100,
        },
        {
            fund: 'Fund 10',
            totalProposals: 1300,
            fundedProposals: 300,
            completedProposals: 30,
        },
        {
            fund: 'Fund 11',
            totalProposals: 900,
            fundedProposals: 300,
            completedProposals: 30,
        },
        {
            fund: 'Fund 12',
            totalProposals: 1100,
            fundedProposals: 200,
            completedProposals: 20,
        },
        {
            fund: 'Fund 13',
            totalProposals: 1600,
            fundedProposals: 200,
            completedProposals: 0,
        },
    ];

    return (
        <FiltersProvider defaultFilters={filters}>
            <ModalLayout navigate={true} className="px-8">
                <Head title="Charts" />

                {!showCharts && (
                    <div className="flex h-screen w-full flex-col items-center justify-center">
                        <SetChartMetrics
                            onMetricsSet={setShowCharts}
                            onExploreCharts={handleExploreCharts}
                        />
                    </div>
                )}

                {showCharts && (
                    <div>
                        <AllCharts
                            chartData={chartData}
                            onEditMetrics={handleEditMetrics}
                        />
                    </div>
                )}
            </ModalLayout>
        </FiltersProvider>
    );
};

export default Index;
