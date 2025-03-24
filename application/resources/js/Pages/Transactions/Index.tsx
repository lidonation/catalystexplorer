import { Head, Link } from '@inertiajs/react';
import { CardanoTransactionTable } from './Partials/TransactionTable';
import TransactionData = App.DataTransferObjects.TransactionData;
import { useState } from 'react';
import { FiltersProvider } from '@/Context/FiltersContext';
import SearchControls from '@/Components/atoms/SearchControls';
import TransactionSortOptions from '@/lib/TransactionSortOptions';
import { useTranslation } from 'react-i18next';
import { SearchParams } from '../../../types/search-params';
import { PaginatedData } from '../../../types/paginated-data';
import Paginator from '@/Components/Paginator';
import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';

interface Props {
    transactions: PaginatedData<TransactionData[]>;
    metadataLabels: Record<number, string>;
    filters: SearchParams;
}

export default function Transactions({
    transactions,
    metadataLabels,
    filters,
}: Props) {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);

    return (
        <FiltersProvider defaultFilters={filters}>
            <Head title={t('transactions.title')} />

            <div className="mt-4">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <Title level="2">
                        {t('transactions.pageTitle')}
                    </Title>
                    <Paragraph size="sm" className="mt-2 text-gray-600">
                        {t('transactions.pageDescription')}

                    </Paragraph>
                </div>
            </div>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <div className="border-b border-background-lighter w-full mb-4">
                            <Title level="4" className="mb-4 font-bold">
                                {t('transactions.title')}
                            </Title>
                        </div>

                        <section className="w-full mb-4">
                            <SearchControls
                                sortOptions={TransactionSortOptions()}
                                onFiltersToggle={setShowFilters}
                                searchPlaceholder={t('transactions.searchBar.placeholder')}
                            />
                        </section>

                        <div className="overflow-hidden border border-background-lighter rounded-lg">
                            <CardanoTransactionTable transactions={transactions?.data ?? []} />
                            <div className="w-full flex items-center justify-center">
                                {transactions && <Paginator pagination={transactions} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FiltersProvider>
    );
}