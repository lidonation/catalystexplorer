import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import DrepSortingOptions from '@/lib/DrepSortOptions';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import DrepFilters from './Partials/DrepFilters';
import DrepTable from './Partials/DrepTable';
import CatalystDrepData = App.DataTransferObjects.CatalystDrepData;

interface DrepListPageProps extends Record<string, unknown> {
    filters: SearchParams;
    catalystDreps: PaginatedData<CatalystDrepData[]>;
}

const Index = ({ filters, catalystDreps }: DrepListPageProps) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();

    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title="Dreps" />
                <header>
                    <div className="container">
                        <Title level="1">{t('dreps.drepList.title')}</Title>
                    </div>
                    <div className="container">
                        <Paragraph className="text-content">
                            {t('dreps.drepList.subtitle')}
                        </Paragraph>
                    </div>
                </header>

                <section className="container py-8">
                    <div className="bg-background w-full rounded-md p-4 shadow-xs">
                        <div className="flex w-full justify-between py-4">
                            <Title level="4">{t('dreps.dreps')}</Title>
                            <PrimaryLink
                                className="bg-primary text-content-light cursor-pointer p-2 text-white"
                                href={useLocalizedRoute(
                                    'workflows.drepSignUp.index',
                                    {
                                        step: 1,
                                    },
                                )}
                            >
                                {t('dreps.drepList.signUp')}
                            </PrimaryLink>
                        </div>
                        <div className="border-dark/30 border-t py-4">
                            <SearchControls
                                border={'border-dark-light'}
                                searchPlaceholder={t('dreps.drepSearch')}
                                sortOptions={DrepSortingOptions()}
                                onFiltersToggle={setShowFilters}
                            />
                        </div>

                        <div
                            className={`flex w-full flex-col items-center justify-center overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                                showFilters ? 'max-h-[500px]' : 'max-h-0'
                            }`}
                        >
                            <DrepFilters />
                        </div>

                        <div>
                            <DrepTable dreps={catalystDreps?.data || []} />
                        </div>

                        <div className="bg-background-lighter rounded-b-lg p-4 shadow-md">
                            {catalystDreps && (
                                <Paginator pagination={catalystDreps} />
                            )}
                        </div>
                    </div>
                </section>
            </FiltersProvider>
        </>
    );
};

export default Index;
