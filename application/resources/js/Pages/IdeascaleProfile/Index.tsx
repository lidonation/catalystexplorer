import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import IdeascaleSortingOptions from '@/lib/IdeascaleSortOptions';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import { PaginatedData } from '../../types/paginated-data';
import { SearchParams } from '../../types/search-params';
import IdeascaleProfilePaginatedList from './Partials/IdeascaleProfilePaginatedList';
import IdeascaleProfilesFilters from './Partials/IdeascaleProfilesFilters';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfilesCount: number;
    ideascaleProfiles: PaginatedData<IdeascaleProfilesData[]>;
    filters: SearchParams;
}
const Index = ({
    ideascaleProfiles,
    filters,
    ideascaleProfilesCount,
}: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useLaravelReactI18n();

    const [showFilters, setShowFilters] = useState(false);
    const profiles = ideascaleProfiles?.data ?? [];

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(profiles.length === 0);
    }, [profiles]);
    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title="Ideascale Profiles" />

                <header className="container py-2">
                    <Title>{t('ideascaleProfiles.ideascaleProfiles')}</Title>
                    <p className="text-content">
                        {t('ideascaleProfiles.pageSubtitle')}
                    </p>
                </header>

                <section className="container">
                    <SearchControls
                        sortOptions={IdeascaleSortingOptions()}
                        onFiltersToggle={setShowFilters}
                        searchPlaceholder={t('searchBar.placeholder')}
                    />
                </section>

                <section
                    className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        showFilters ? 'max-h-[500px]' : 'max-h-0'
                    }`}
                >
                    <IdeascaleProfilesFilters />
                </section>

                <IdeascaleProfilePaginatedList
                    ideascaleProfiles={ideascaleProfiles}
                />
            </FiltersProvider>
        </>
    );
};

export default Index;
