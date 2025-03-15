import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import DrepSortingOptions from '@/lib/DrepSortOptions';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import DrepTable from './Partials/DrepTable';
import DrepFilters from './Partials/DrepFilters';

interface DrepListPageProps extends Record<string, unknown> {
    filters: SearchParams;
}

type Drep = {
    drep: string;
    registeredOn: string;
    lastActive: string;
    votingPower: string;
    status: 'Active' | 'Inactive';
    delegators: string;
};

const Index = ({ filters }: DrepListPageProps) => {
    const [showFilters, setShowFilters] = useState(false);
    const { t } = useTranslation();

    const drepList: PaginatedData<Drep[]> = {
        data: [
            {
                drep: 'f6g7Z8h9R0TfUaSdTf',
                registeredOn: 'Mar 4, 2025 10:19 AM',
                lastActive: 'Mar 4, 2025 10:19 AM',
                votingPower: '₳ 465,608.842',
                status: 'Active',
                delegators: '34',
            },
            {
                drep: 'f6g7Z8h9R0TfUaSdTf',
                registeredOn: 'Mar 4, 2025 10:19 AM',
                lastActive: 'Mar 4, 2025 10:19 AM',
                votingPower: '₳ 465,608.842',
                status: 'Active',
                delegators: '124',
            },
            {
                drep: 'f6g7Z8h9R0TfUaSdTf',
                registeredOn: 'Mar 4, 2025 10:19 AM',
                lastActive: 'Mar 4, 2025 10:19 AM',
                votingPower: '₳ 465,608.842',
                status: 'Inactive',
                delegators: '67',
            },
            {
                drep: 'f6g7Z8h9R0TfUaSdTf',
                registeredOn: 'Mar 4, 2025 10:19 AM',
                lastActive: 'Mar 4, 2025 10:19 AM',
                votingPower: '₳ 465,608.842',
                status: 'Inactive',
                delegators: '12',
            },
            {
                drep: 'f6g7Z8h9R0TfUaSdTf',
                registeredOn: 'Mar 4, 2025 10:19 AM',
                lastActive: 'Mar 4, 2025 10:19 AM',
                votingPower: '₳ 465,608.842',
                status: 'Active',
                delegators: '7',
            },
            {
                drep: 'f6g7Z8h9R0TfUaSdTf',
                registeredOn: 'Mar 4, 2025 10:19 AM',
                lastActive: 'Mar 4, 2025 10:19 AM',
                votingPower: '₳ 465,608.842',
                status: 'Inactive',
                delegators: '451',
            },
        ],
        total: 6,
        current_page: 1,
        per_page: 6,
        first_page_url: '',
        from: 1,
        last_page: 2,
        last_page_url: '',
        links: [],
        next_page_url: '',
        path: '',
        prev_page_url: '',
        to: 6,
    };

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
                            <Button className="bg-primary text-content-light cursor-pointer p-2 text-white">
                                {t('dreps.drepList.signUp')}
                            </Button>
                        </div>
                        <div className="border-dark/30 border-t py-4">
                            <SearchControls
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
                           <DrepFilters/>
                        </div>

                        <div>
                            <DrepTable dreps={drepList?.data || []} />
                        </div>

                        <div className="bg-background-lighter rounded-b-lg p-4 shadow-md">
                            {drepList && <Paginator pagination={drepList} />}
                        </div>
                    </div>
                </section>
            </FiltersProvider>
        </>
    );
};

export default Index;
