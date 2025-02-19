import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import { ListProvider } from '@/Context/ListContext';
import { Head, WhenVisible } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import CommunityData = App.DataTransferObjects.CommunityData;
import SearchControls from '@/Components/atoms/SearchControls';
import CommunitySortingOptions from '@/lib/CommunitySortOptions';
import CommunityFilters from './Partials/CommunityFilter';
import CommunityList from './Partials/CommunityList';
import CommunityCardLoader from './Partials/CommunityCardLoader';


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
                <FiltersProvider
                    defaultFilters={filters || {}}
                    routerOptions={{ only: ['communities'] }}
                >
                    <Head title="Communities" />

                    <header>
                        <div className="container py-2">
                            <Title level="1">{t('communities.title')}</Title>
                            <p className="text-content">
                                {t('communities.subtitle')}
                            </p>
                        </div>
                    </header>

                    <SearchControls
                        sortOptions={CommunitySortingOptions()}
                        onFiltersToggle={setShowFilters}
                    />

                    <section
                        className={`container flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${showFilters ? 'max-h-[500px]' : 'max-h-0'
                            }`}
                    >
                        <CommunityFilters
                            proposalsCount={filterCounts?.proposalsCount}
                            totalAwardedAda={filterCounts?.totalAwardedAda}
                            totalAwardedUsd={filterCounts?.totalAwardedUsd} />
                    </section>

                    <section className="container py-8">
                        <WhenVisible
                            fallback={<CommunityCardLoader />}
                            data="groups"
                        >
                            <CommunityList communities={communities?.data || []} />
                        </WhenVisible>
                    </section>

                    <section className="w-full px-4 lg:container lg:px-0">
                        {/* {communities && <Paginator pagination={communities} />} */}
                    </section>
                </FiltersProvider>
            </ListProvider>
        </>
    );
};

export default Index;
