import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import CommunitySortingOptions from '@/lib/CommunitySortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommunitiesPaginatedList from './Partials/CommunitiesPaginatedList';
import CommunityFilters from './Partials/CommunityFilters';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunitiesPageProps extends Record<string, unknown> {
    communities: PaginatedData<CommunityData[]>;
    filters: SearchParams;
    filterCounts: {
        proposalsCount: number;
        totalAwardedAda: number;
        totalAwardedUsd: number;
    };
}

type FundsType = Record<string, number>;

const Index: React.FC<CommunitiesPageProps> = ({
    communities,
    filters,
    filterCounts,
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
                console.log(err);
            }
        };

        fetchFunds().then();
    }, []);

    return (
        <>
            <ListProvider>
                <FiltersProvider defaultFilters={filters}>
                    <Head title={t('communities.title')} />
                    <header>
                        <div className="container py-2">
                            <Title level="1">{t('communities.title')}</Title>

                            <div className="text-content">
                                {t('communities.subtitle')}
                            </div>
                        </div>
                    </header>
                    <section className="container">
                        <SearchControls
                            sortOptions={CommunitySortingOptions()}
                            onFiltersToggle={setShowFilters}
                        />
                    </section>
                    <section
                        className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                            showFilters ? 'max-h-svh' : 'max-h-0'
                        }`}
                    >
                        <CommunityFilters
                            proposalsCount={filterCounts.proposalsCount}
                            totalAwardedAda={filterCounts.totalAwardedAda}
                            totalAwardedUsd={filterCounts.totalAwardedUsd}
                        />
                    </section>
                    <CommunitiesPaginatedList communities={communities} />
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
