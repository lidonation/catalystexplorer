import Title from '@/Components/atoms/Title';
import { Head, router } from '@inertiajs/react';
import ModalLayout from '@/Layouts/ModalLayout';
import SetChartMetrics from './Partials/SetChartMetrics';
import { FiltersProvider } from '@/Context/FiltersContext';
import { SearchParams } from '@/types/search-params';

interface ChartsIndexProps {
    filters: SearchParams
}
const Index = ({ filters }:ChartsIndexProps) => {

    return (
       <FiltersProvider defaultFilters={filters}>
         <ModalLayout navigate={true}>
            <Head title="Charts"/>

            <div className="flex h-screen w-full flex-col items-center justify-center">
                <SetChartMetrics/>
            </div>
        </ModalLayout>
       </FiltersProvider>
    );
};

export default Index;
