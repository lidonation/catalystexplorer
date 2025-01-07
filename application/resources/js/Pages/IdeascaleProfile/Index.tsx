import { FiltersProvider } from '@/Context/FiltersContext';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import IdeaScaleProfileLoader from './Partials/IdeaScaleProfileLoader';
import IdeascaleProfilesFilters from './Partials/IdeascaleProfilesFilters';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import Paginator from '@/Components/Paginator';
import { useState, useEffect } from 'react';
import { PaginatedData } from '../../../types/paginated-data';
import IdeaScaleProfileToolbar from "@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileToolbar";

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfiles: IdeascaleProfilesData[];
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

                <section className="container flex w-full flex-col items-center justify-center py-8">
                    <IdeascaleProfilesFilters />
                </section>

                <div className="flex w-full flex-col items-center">
                    <section className="container py-8">
                        <WhenVisible fallback={<IdeaScaleProfileLoader/>} data="ideascaleProfiles">
                            <IdeascaleProfilesList
                                ideascaleProfiles={ideascaleProfiles}
                            />
                        </WhenVisible>
                    </section>
                </div>
            </FiltersProvider>
        </>
    );
};

export default Index;
