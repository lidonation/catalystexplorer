import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { UIProvider } from '@/Context/SharedUIContext';
import IdeaScaleProfileToolbar from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileToolbar';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import PlayerBar from '../../Components/PlayerBar';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import IdeaScaleProfileLoader from './Partials/IdeaScaleProfileLoader';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfiles: PaginatedData<IdeascaleProfilesData[]>;
    filters: ProposalSearchParams;
}
const Index = ({
    ideascaleProfiles,
    filters,
}: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useTranslation();
    const [perPage, setPerPage] = useState<number>(24);
    const [currentPage, setCurrentPage] = useState<number>(1);

    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title="Ideascale Profiles" />

                <header className="container">
                    <h1 className="title-1">
                        {t('ideascaleProfiles.ideascaleProfiles')}
                    </h1>
                    <p className="text-content">
                        {t('ideascaleProfiles.pageSubtitle')}
                    </p>
                </header>

                <section className="container flex w-full flex-col items-center justify-center">
                    <IdeaScaleProfileToolbar />
                </section>

                <div className="flex w-full flex-col items-center">
                    <section className="container py-8">
                        <WhenVisible
                            fallback={<IdeaScaleProfileLoader />}
                            data="ideascaleProfiles"
                        >
                            <IdeascaleProfilesList
                                ideascaleProfiles={ideascaleProfiles.data || []}
                            />
                        </WhenVisible>
                    </section>
                </div>

                <section className="w-full px-4 lg:container lg:px-0">
                    <Paginator
                        pagination={ideascaleProfiles}
                        setPerPage={setPerPage}
                        setCurrentPage={setCurrentPage}
                    />
                </section>
            </FiltersProvider>
        </>
    );
};

export default Index;
