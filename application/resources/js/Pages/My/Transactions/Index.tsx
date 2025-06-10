import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import TransactionSortOptions from '@/lib/TransactionSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MyTransactionTable from './Partials/MyTranscationsTable';
import TransactionData = App.DataTransferObjects.TransactionData;

interface MyTransactionProps {
    transactions: PaginatedData<TransactionData[]>;
    metadataLabels: Record<number, string>;
    filters: SearchParams;
}

const MyTransaction: React.FC<MyTransactionProps> = ({
    transactions,
    filters,
}) => {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);
    const hasTransactions = transactions?.data?.length > 0;

    return (
        <FiltersProvider defaultFilters={filters}>
            <Head title="My Transactions" />
            <div className="py-8">
                <div className="max-w-10xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden p-6 shadow-md sm:rounded-lg">
                        <div className="border-background-lighter relative mb-4 flex w-full items-center border-b">
                            <Title level="4" className="mb-4 font-bold">
                                {t('transactions.title')}
                            </Title>
                            <PrimaryLink
                                className="lg:text-md mb-4 ml-auto px-4 py-2 text-sm text-nowrap"
                                href={useLocalizedRoute(
                                    'workflows.signature.index',
                                    {
                                        step: 1,
                                    },
                                )}
                            >
                                {`+ ${t('my.connectWallet')}`}
                            </PrimaryLink>
                        </div>

                        <section className="mb-4 w-full">
                            <SearchControls
                                withFilters={false}
                                sortOptions={TransactionSortOptions()}
                                onFiltersToggle={setShowFilters}
                                searchPlaceholder={t(
                                    'transactions.searchBar.placeholder',
                                )}
                            />
                        </section>

                        {hasTransactions ? (
                            <div className="border-background-lighter overflow-hidden rounded-lg border">
                                <MyTransactionTable
                                    transactions={transactions.data}
                                />
                                <div className="flex w-full items-center justify-center">
                                    <Paginator pagination={transactions} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-background mb-10 flex w-full flex-col items-center justify-center rounded-lg px-4 py-8">
                                <RecordsNotFound />
                                <Paragraph className="text-dark mt-4 text-center">
                                    {t('my.noTransactions')}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FiltersProvider>
    );
};

export default MyTransaction;
