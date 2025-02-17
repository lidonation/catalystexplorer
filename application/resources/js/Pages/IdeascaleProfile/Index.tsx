import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import IdeascaleSortingOptions from '@/lib/IdeascaleSortOptions';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import IdeaScaleProfileLoader from './Partials/IdeaScaleProfileLoader';
import IdeascaleProfilesFilters from './Partials/IdeascaleProfilesFilters';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfiles: PaginatedData<IdeascaleProfilesData[]>;
    filters: SearchParams;
}
const Index = ({
    ideascaleProfiles,
    filters,
}: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useTranslation();

    const [showFilters, setShowFilters] = useState(false);
    const profiles = ideascaleProfiles?.data ?? [];
    const maxProfilesPerPage = ideascaleProfiles?.per_page ?? 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => { setLoading(profiles.length === 0);}, [profiles])
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

                <SearchControls
                    sortOptions={IdeascaleSortingOptions()}
                    onFiltersToggle={setShowFilters}
                />

                <section
                    className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                        showFilters ? 'max-h-[500px]' : 'max-h-0'
                    }`}
                >
                    <IdeascaleProfilesFilters />
                </section>

                <div className="flex w-full flex-col items-center">
                    <section className="container py-2 pb-10">
                        <WhenVisible
                            fallback={<IdeaScaleProfileLoader count={maxProfilesPerPage} />}
                            data="ideascaleProfiles"
                        >
                            <IdeascaleProfilesList
                                ideascaleProfiles={ideascaleProfiles.data || []}
                            />
                        </WhenVisible>
                    </section>
                </div>

                {!loading && ideascaleProfiles && ideascaleProfiles.total > maxProfilesPerPage && (
                    <section className="w-full px-4 lg:container lg:px-0">
                        <Paginator pagination={ideascaleProfiles} />
                    </section>
                )}
            </FiltersProvider>
        </>
    );
};

export default Index;
