import Paginator from '@/Components/Paginator';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { Head, WhenVisible } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import FundFiltersContainer from '../Proposals/Partials/FundFiltersContainer';
import GroupCardLoader from './Partials/GroupCardMiniLoader';
import GroupFilters from './Partials/GroupFilters';
import GroupList from './Partials/GroupList';
import GroupData = App.DataTransferObjects.GroupData;
import SearchControls from '@/Components/atoms/SearchControls';
import GroupSortingOptions from '@/lib/GroupSortOptions';

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
    funds
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <ListProvider>
                <FiltersProvider
                    defaultFilters={filters}
                    routerOptions={{ only: ['groups','funds'] }}
                >
                    <Head title="Groups" />

                    <header>
                        <div className="container py-2">
                            <Title level="1">{t('groups.title')}</Title>
                            <p className="text-content">
                        {t('groups.subtitle')}
                    </p>
                        </div>
                    </header>

                    <section className="container">
                        <FundFiltersContainer funds={funds} />
                    </section>

                    <SearchControls onFiltersToggle={setShowFilters} sortOptions={GroupSortingOptions()}/>

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

                    <section className="w-full px-4 lg:container lg:px-0">
                        {groups && <Paginator pagination={groups} />}
                    </section>
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
