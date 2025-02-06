import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import FundFiltersContainer from '../Proposals/Partials/FundFiltersContainer';
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
    const { t } = useTranslation();

    useEffect(() => {
        console.log('funds', filters);
    });
    const funds1 ={
        "Fund 32": 61,
        "Fund 58": 97,
        "Fund 84": 61,
        "Fund 95": 42
    }
    return (
        <>
            <ListProvider>
                <FiltersProvider defaultFilters={filters} routerOptions={{ only: ['groups'] }}>
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

                    <section className="container bg-green-200">
                        <FundFiltersContainer funds={funds1} />
                    </section>
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
