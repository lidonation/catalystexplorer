import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import VoterSortOptions from '@/lib/VoterSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';
import VoterFilters from './Partials/VoterFilters';
import VotersTable from './Partials/VotersTable';
import VoterData = App.DataTransferObjects.VoterData;

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

            <div className="mx-auto mt-4 flex max-w-[1440px] flex-col px-6">
                <div className="mt-6 mb-10">
                    <Title level="1">{t('voter.catalystVoters')}</Title>
                    <Paragraph
                        children={t('voter.viewVoterInformation')}
                        className="text-gray-persist"
                    />
                </div>

                <div className="bg-background mb-8 rounded-lg border-2 border-gray-300 p-6 shadow-md">
                    <SearchControls
                        onFiltersToggle={setShowFilters}
                        sortOptions={sortOptions}
                        searchPlaceholder={t('voter.searchPlaceholder')}
                    />

                    <section
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
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
        <FiltersProvider defaultFilters={props.filters || ({} as SearchParams)}>
            <IndexComponent {...props} />
        </FiltersProvider>
    );
};

export default Index;
