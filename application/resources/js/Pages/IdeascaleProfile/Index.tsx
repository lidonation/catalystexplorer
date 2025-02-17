import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import IdeaScaleProfileLoader from './Partials/IdeaScaleProfileLoader';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import Title from '@/Components/atoms/Title';
import { useState, useEffect } from 'react';

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfiles?: PaginatedData<IdeascaleProfilesData[]>;
    filters: SearchParams;
}

const Index = ({ ideascaleProfiles, filters }: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useTranslation();
    
    const profiles = ideascaleProfiles?.data ?? [];
    const maxProfilesPerPage = ideascaleProfiles?.per_page ?? 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(profiles.length === 0);
    }, [profiles]);

    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title={t('ideascaleProfiles.ideascaleProfiles')} />

                <header className="container">
                    <Title>{t('ideascaleProfiles.ideascaleProfiles')}</Title>
                    <p className="text-content">{t('ideascaleProfiles.pageSubtitle')}</p>
                </header>

                <section className="container flex w-full flex-col items-center justify-center">
                    <ideascaleProfiles />
                </section>

                <div className="flex w-full flex-col items-center">
                    <section className="container py-2 pb-10">
                        <WhenVisible 
                            data="IdeaScaleProfiles"
                            fallback={<IdeaScaleProfileLoader count={maxProfilesPerPage} />}
                        >
                            <IdeascaleProfilesList ideascaleProfiles={profiles} />
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
