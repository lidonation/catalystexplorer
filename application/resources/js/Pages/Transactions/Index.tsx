import Paginator from '@/Components/Paginator';
import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import TransactionSortOptions from '@/lib/TransactionSortOptions';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { CardanoTransactionTable } from './Partials/TransactionTable';
import TransactionData = App.DataTransferObjects.TransactionData;

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
                    <Title level="2">{t('transactions.pageTitle')}</Title>
                    <Paragraph size="sm" className="mt-2 text-gray-600">
                        {t('transactions.pageDescription')}
                    </Paragraph>
                </div>
            </div>

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <div className="border-background-lighter mb-4 w-full border-b">
                            <Title level="4" className="mb-4 font-bold">
                                {t('transactions.title')}
                            </Title>
                        </div>

                        <section className="mb-4 w-full">
                            <SearchControls
                                sortOptions={TransactionSortOptions()}
                                onFiltersToggle={setShowFilters}
                                searchPlaceholder={t(
                                    'transactions.searchBar.placeholder',
                                )}
                            />
                        </section>

                        <div className="border-background-lighter overflow-hidden rounded-lg border">
                            <CardanoTransactionTable
                                transactions={transactions?.data ?? []}
                            />
                            <div className="flex w-full items-center justify-center">
                                {transactions && (
                                    <Paginator pagination={transactions} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FiltersProvider>
    );
}
