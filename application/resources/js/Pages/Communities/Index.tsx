import Paginator from '@/Components/Paginator';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import CommunitySortingOptions from '@/lib/CommunitySortOptions';
import { Head, WhenVisible } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import CommunitiesList from './Partials/CommunitiesList';
import CommunityFilters from './Partials/CommunityFilters';
import CommunityLoader from './Partials/CommunityLoader';
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
                    <Head title="Communities" />

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
                            showFilters ? 'max-h-[500px]' : 'max-h-0'
                        }`}
                    >
                        <CommunityFilters
                            proposalsCount={filterCounts.proposalsCount}
                            totalAwardedAda={filterCounts.totalAwardedAda}
                            totalAwardedUsd={filterCounts.totalAwardedUsd}
                        />
                    </section>

                    <section className="container flex w-full flex-col items-center justify-center overflow-hidden py-8 duration-500 ease-in-out">
                        <WhenVisible
                            fallback={<CommunityLoader />}
                            data="campaigns"
                        >
                            <CommunitiesList communities={communities} />
                        </WhenVisible>
                    </section>
                    <section className="container w-full py-8">
                        {communities && <Paginator pagination={communities} />}
                    </section>
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
