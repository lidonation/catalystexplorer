import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import IdeaScaleProfileToolbar from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileToolbar';
import { PageProps } from '@/types';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import IdeascaleProfilesList from './Partials/IdeascaleProfileList';
import IdeaScaleProfileLoader from './Partials/IdeaScaleProfileLoader';
import IdeascaleProfilesData = App.DataTransferObjects.IdeascaleProfileData;
import Title from '@/Components/atoms/Title';

interface IdeascaleProfilesPageProps extends Record<string, unknown> {
    ideascaleProfiles: PaginatedData<IdeascaleProfilesData[]>;
    filters: ProposalSearchParams;
}
const Index = ({
    ideascaleProfiles,
    filters,
}: PageProps<IdeascaleProfilesPageProps>) => {
    const { t } = useTranslation();

    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title="Ideascale Profiles" />

                <header className="container">
                    <Title>
                        {t('ideascaleProfiles.ideascaleProfiles')}
                    </Title>
                    <p className="text-content">
                        {t('ideascaleProfiles.pageSubtitle')}
                    </p>
                </header>

                <section className="container flex w-full flex-col items-center justify-center">
                    <IdeaScaleProfileToolbar />
                </section>

                <div className="flex w-full flex-col items-center">
                    <section className="container py-2 pb-10">
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
                    />
                </section>
            </FiltersProvider>
        </>
    );
};

export default Index;
