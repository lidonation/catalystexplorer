import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import FundFiltersContainer from '../Proposals/Partials/FundFiltersContainer';
import ProposalSearchControls from '../Proposals/Partials/ProposalSearchControls';
import GroupFilters from './Partials/GroupFilters';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupsPageProps extends Record<string, unknown> {
    groups: {
        links: [];
        total: number;
        to: number;
        from: number;
        data: GroupData[];
    };
    search?: string | null;
    sort?: string;
    filters: ProposalSearchParams;
    filterCounts: {
        tagsCount: [];
        fundsCount: { [key: string]: number };
    };
}

const Index: React.FC<GroupsPageProps> = ({
    groups,
    filters,
    filterCounts,
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <ListProvider>
                <FiltersProvider
                    defaultFilters={filters}
                    routerOptions={{ only: ['groups'] }}
                >
                    <Head title="Groups" />

                    <header>
                        <div className="container">
                            <h1 className="title-1">{t('groups.title')}</h1>
                        </div>

                        <div className="container">
                            <p className="text-content">
                                {t('groups.subtitle')}
                            </p>
                        </div>
                    </header>

                    <section className="container">
                        <FundFiltersContainer funds={filterCounts.fundsCount} />
                    </section>

                    <ProposalSearchControls onFiltersToggle={setShowFilters} />

                    <section
                        className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                            showFilters ? 'max-h-[500px]' : 'max-h-0'
                        }`}
                    >
                        <GroupFilters />
                    </section>
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
