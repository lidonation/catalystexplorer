import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalSearchParams } from '../../../types/proposal-search-params';
import FundFiltersContainer from '../Proposals/Partials/FundFiltersContainer';
import GroupFilters from './Partials/GroupFilters';
import { PaginatedData } from '../../../types/paginated-data';
import Paginator from '@/Components/Paginator';
import GroupData = App.DataTransferObjects.GroupData;
import GroupList from './Partials/GroupList';
import GroupSearchControls from './Partials/GroupSearchControls';
import axios from 'axios';

interface GroupsPageProps extends Record<string, unknown> {
    groups: PaginatedData<GroupData[]>;
    search?: string | null;
    sort?: string;
    filters: ProposalSearchParams;
    fundsType: { [key: string]: number };
    filterCounts: {
        tagsCount: [];
        fundsCount: { [key: string]: number };
        proposalsCount: number;
        awardedAda: number
    };
}

type FundsType = Record<string, number>;

const Index: React.FC<GroupsPageProps> = ({
    groups,
    filters,
    filterCounts,
    fundsType
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();
    const [funds, setFunds] = useState<FundsType>({});

    useEffect(() => {
        const fetchFunds = async () => {
          try {
            const response = await axios.get(route('api.fundCounts'));
            setFunds(response.data);
          } catch (err) {
            console.log(err)
          }
        };
    
        fetchFunds();
        
      }, []);

      useEffect(()=>{
        console.log('funds', funds)
      })

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
                        <FundFiltersContainer funds={funds} />
                    </section>

                    <GroupSearchControls onFiltersToggle={setShowFilters} />

                    <section
                        className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                            showFilters ? 'max-h-[500px]' : 'max-h-0'
                        }`}
                    >
                        <GroupFilters proposalsCount={filterCounts.proposalsCount}/>
                    </section>

                    <section className="container py-8">
                        <GroupList groups={groups?.data || []} />
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
