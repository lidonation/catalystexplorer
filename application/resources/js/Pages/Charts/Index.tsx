import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import ModalLayout from '@/Layouts/ModalLayout';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import SetChartMetrics from './Partials/SetChartMetrics';
import AllCharts from './Partials/AllCharts';

interface ChartsIndexProps {
    filters: SearchParams;
}


const Index = ({ filters }: ChartsIndexProps) => {
    const [metricsSet, setMetricsSet] = useState(false);

    const handleMetricsSet = (isSet: boolean): void => {
        setMetricsSet(isSet);
    };

    const chartData: any = [
        {
            fund: 'Fund 13',
            totalProposals: 1600,
            fundedProposals: 200,
            completedProposals: 0,
        },
        {
            fund: 'Fund 12',
            totalProposals: 1100,
            fundedProposals: 200,
            completedProposals: 20,
        },
        {
            fund: 'Fund 11',
            totalProposals: 900,
            fundedProposals: 300,
            completedProposals: 30,
        },
        {
            fund: 'Fund 10',
            totalProposals: 1300,
            fundedProposals: 300,
            completedProposals: 30,
        },
        {
            fund: 'Fund 9',
            totalProposals: 1100,
            fundedProposals: 300,
            completedProposals: 100,
        },
        {
            fund: 'Fund 8',
            totalProposals: 1000,
            fundedProposals: 400,
            completedProposals: 200,
        },
        {
            fund: 'Fund 7',
            totalProposals: 823,
            fundedProposals: 525,
            completedProposals: 511,
        },
        {
            fund: 'Fund 6',
            totalProposals: 600,
            fundedProposals: 200,
            completedProposals: 100,
        },
        {
            fund: 'Fund 5',
            totalProposals: 300,
            fundedProposals: 100,
            completedProposals: 80,
        },
        {
            fund: 'Fund 4',
            totalProposals: 300,
            fundedProposals: 100,
            completedProposals: 70,
        },
        {
            fund: 'Fund 3',
            totalProposals: 150,
            fundedProposals: 50,
            completedProposals: 40,
        },
    ];

    return (
        <FiltersProvider defaultFilters={filters}>
            <ModalLayout navigate={true} className='px-8'>
                <Head title="Charts" />

                {!metricsSet && (
                    <div className="flex h-screen w-full flex-col items-center justify-center">
                        <SetChartMetrics onMetricsSet={handleMetricsSet} />
                    </div>
                )}

                {metricsSet && (
                    <div>
                        <AllCharts chartData={chartData} />
                    </div>
                )}
            </ModalLayout>
        </FiltersProvider>
    );
};

export default Index;
