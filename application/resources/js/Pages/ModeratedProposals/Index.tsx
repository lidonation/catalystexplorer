import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import ModeratedProposalsFilter from './Partials/ModeratedProposalsFilter';
import ModeratedProposalsTable from './Partials/ModeratedProposalsTable';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ModeratedProposalsPageProps extends Record<string, unknown> {
    proposals: PaginatedData<ProposalData[]>;
    funds: any[];
    fundsCount: Record<string, any>;
    filters: SearchParams;
}

const Index: React.FC<ModeratedProposalsPageProps> = ({
    proposals,
    funds,
    fundsCount,
    filters,
}) => {
    const { t } = useLaravelReactI18n();

    return (
        <FiltersProvider
            defaultFilters={filters}
            routerOptions={{ only: ['proposals', 'funds', 'fundsCount'] }}
        >
            <Head title={t('moderatedProposals.title')} />

            <header>
                <div className="container">
                    <Title level="1">{t('moderatedProposals.title')}</Title>
                    <p className="text-content mt-2">
                        {t('moderatedProposals.description')}
                    </p>
                </div>
            </header>

            <section className="container">
                <SearchControls
                    onFiltersToggle={() => {}}
                    sortOptions={[]}
                    searchPlaceholder={t('searchBar.searchProposals')}
                    withFilters={false}
                />
            </section>

            <section className="container">
                <ModeratedProposalsFilter
                    funds={funds}
                    fundsCount={fundsCount}
                />
            </section>

            <div className="flex w-full flex-col items-center justify-center">
                <section className="container">
                    {proposals.data && proposals.data.length > 0 ? (
                        <ModeratedProposalsTable proposals={proposals} />
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-lg text-content">
                                {t('moderatedProposals.noProposals')}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </FiltersProvider>
    );
};

export default Index;
