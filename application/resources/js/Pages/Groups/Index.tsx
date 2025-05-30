import Paginator from '@/Components/Paginator';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import GroupSortingOptions from '@/lib/GroupSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head, WhenVisible } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FundFiltersContainer from '../Proposals/Partials/FundFiltersContainer';
import GroupCardLoader from './Partials/GroupCardMiniLoader';
import GroupFilters from './Partials/GroupFilters';
import GroupList from './Partials/GroupList';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupsPageProps extends Record<string, unknown> {
    groups: PaginatedData<GroupData[]>;
    filters: SearchParams;
    funds: { [key: string]: number };
    filterCounts: {
        proposalsCount: number;
        totalAwardedAda: number;
        totalAwardedUsd: number;
    };
}

const Index: React.FC<GroupsPageProps> = ({
    groups,
    filters,
    filterCounts,
    funds,
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <ListProvider>
                <FiltersProvider
                    defaultFilters={filters}
                    routerOptions={{ only: ['groups', 'funds'] }}
                >
                    <Head title="Groups" />

                    <header>
                        <div className="container py-2">
                            <Title level="1">{t('groups.title')}</Title>

                            <div className="text-content">
                                {t('groups.subtitle')}
                            </div>
                        </div>
                    </header>

                    <section className="container">
                        <FundFiltersContainer funds={funds} />
                    </section>

                    <section className="container">
                        <SearchControls
                            onFiltersToggle={setShowFilters}
                            sortOptions={GroupSortingOptions()}
                            searchPlaceholder={t('searchBar.placeholder')}
                        />
                    </section>

                    <section
                        className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                            showFilters ? 'max-h-[500px]' : 'max-h-0'
                        }`}
                    >
                        <GroupFilters
                            proposalsCount={filterCounts.proposalsCount}
                            totalAwardedAda={filterCounts.totalAwardedAda}
                            totalAwardedUsd={filterCounts.totalAwardedUsd}
                        />
                    </section>

                    <section className="container py-8">
                        <WhenVisible
                            fallback={<GroupCardLoader />}
                            data="groups"
                        >
                            <GroupList groups={groups?.data || []} />
                        </WhenVisible>
                    </section>

                    <section className="container">
                        {groups && <Paginator pagination={groups} />}
                    </section>
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
