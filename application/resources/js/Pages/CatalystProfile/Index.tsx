import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import IdeascaleSortingOptions from '@/lib/IdeascaleSortOptions';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import { PaginatedData } from '../../types/paginated-data';
import { SearchParams } from '../../types/search-params';
import CatalystProfilesFilters from './Partials/CatalystProfilesFilters';
import CatalystProfilesData = App.DataTransferObjects.CatalystProfileData;
import CatalystProfilePaginatedList from '@/Pages/CatalystProfile/Partials/CatalystPaginatedList.tsx';

interface CatalystProfilesPageProps extends Record<string, unknown> {
    catalystProfilesCount: number;
    catalystProfiles: PaginatedData<CatalystProfilesData[]>;
    filters: SearchParams;
}
const Index = ({
    catalystProfiles,
    filters,
    catalystProfilesCount,
}: PageProps<CatalystProfilesPageProps>) => {
    const { t } = useLaravelReactI18n();

    const [showFilters, setShowFilters] = useState(false);
    const profiles = catalystProfiles?.data ?? [];

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(profiles.length === 0);
    }, [profiles]);
    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title="Catalyst Profiles" />

                <header className="container py-2">
                    <Title>{t('catalystProfiles.catalystProfiles')}</Title>
                    <p className="text-content">
                        {t('catalystProfiles.pageSubtitle')}
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
                    <CatalystProfilesFilters />
                </section>

                <CatalystProfilePaginatedList
                    catalystProfiles={catalystProfiles}
                />
            </FiltersProvider>
        </>
    );
};

export default Index;
