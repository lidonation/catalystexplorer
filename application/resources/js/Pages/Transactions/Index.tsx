import Paginator from '@/Components/Paginator';
import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import TransactionSortOptions from '@/lib/TransactionSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
                <div className="pl-4 sm:pl-6 lg:pl-8">
                    <Title level="2">{t('transactions.pageTitle')}</Title>
                    <Paragraph size="sm" className="text-gray-persist mt-2">
                        {t('transactions.pageDescription')}
                    </Paragraph>
                </div>
            </div>

                <div className="container lg:my-12 my-8">
                    <div className="bg-background border-gray-200 overflow-hidden bg-white p-6 shadow-xl sm:rounded-lg">
                        <div className="border-gray-200 mb-4 w-full">
                            <Title level="4" className="mb-4 font-bold">
                                {t('transactions.title')}
                            </Title>
                        </div>
                       <hr className="border-gray-200 mb-6" />
                        <section className="mb-4 w-full">
                            <SearchControls
                                withFilters={true}
                                sortOptions={TransactionSortOptions()}
                                onFiltersToggle={setShowFilters}
                                searchPlaceholder={t(
                                    'transactions.searchBar.placeholder',
                                )}
                            />
                        </section>

                        <div className=" border-gray-200 overflow-hidden rounded-lg shadow-md">
                            <CardanoTransactionTable
                                transactions={transactions?.data ?? []}
                            />
                            <div className="w-full">
                                {transactions && (
                                    <Paginator pagination={transactions} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
        </FiltersProvider>
    );
}
