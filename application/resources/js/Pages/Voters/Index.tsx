import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import SearchControls from '@/Components/atoms/SearchControls';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import VoterSortOptions from '@/lib/VoterSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import VotersTable from './Partials/VotersTable';
import VoterData = App.DataTransferObjects.VoterData;
import VoterFilters from './Partials/VoterFilters';

interface VotersProps {
    voters?: PaginatedData<VoterData[]>;
    search?: string;
    sort?: string;
    filters?: SearchParams;
}

const IndexComponent: React.FC<VotersProps> = (props) => {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const { t } = useLaravelReactI18n();
    const { voters, filters } = props;

    const sortOptions = VoterSortOptions();

return (
    <>
        <Head title={t('voter.catalystVoters')} />

        <div className="max-w-[1440px] mx-auto px-6 mt-4 flex flex-col">
            <div className="mt-6 mb-10">
                <Title level="1">{t('voter.catalystVoters')}</Title>
                <Paragraph
                    children={t('voter.viewVoterInformation')}
                    className="text-gray-persist"
                />
            </div>

            <div className="mb-8 rounded-lg border-2 border-gray-300 bg-background shadow-md p-6">
                <SearchControls
                    onFiltersToggle={setShowFilters}
                    sortOptions={sortOptions}
                    searchPlaceholder={t('voter.searchPlaceholder')}
                />

                <section
                    className={` overflow-hidden transition-all duration-500 ease-in-out ${
                        showFilters ? 'my-4 max-h-[500px]' : 'max-h-0'
                    }`}
                >
                    <VoterFilters />
                </section>

                <VotersTable
                    voters={voters as PaginatedData<VoterData[]>}
                />
            </div>

        </div>
    </>
);
};
const Index: React.FC<VotersProps> = (props) => {
    return (
        <FiltersProvider
            defaultFilters={props.filters || ({} as SearchParams)}
        >
            <IndexComponent {...props} />
        </FiltersProvider>
    );
};

export default Index;
