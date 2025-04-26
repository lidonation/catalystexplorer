import { Head } from "@inertiajs/react";
import React, { useState } from "react";
import MyLayout from "../MyLayout";
import RecordsNotFound from "@/Layouts/RecordsNotFound";
import MyTransactionTable from "./Partials/MyTranscationsTable";
import TransactionData = App.DataTransferObjects.TransactionData;
import { PaginatedData } from "../../../../types/paginated-data";
import { SearchParams } from "../../../../types/search-params";
import Paginator from "@/Components/Paginator";
import { useTranslation } from "react-i18next";
import SearchControls from "@/Components/atoms/SearchControls";
import TransactionSortOptions from "@/lib/TransactionSortOptions";
import Title from "@/Components/atoms/Title";
import Paragraph from "@/Components/atoms/Paragraph";

interface MyTransactionProps {
    transactions: PaginatedData<TransactionData[]>;
    metadataLabels: Record<number, string>;
    filters: SearchParams;
}

const MyTransaction: React.FC<MyTransactionProps> = ({transactions}) => {
    const { t } = useTranslation();
    const [showFilters, setShowFilters] = useState(false);
    const hasTransactions = transactions?.data?.length > 0;

    return (
        <MyLayout>
            <Head title="My Transactions" />

            <div className="py-6">
                <div className="mx-auto max-w-10xl sm:px-6 lg:px-8">
                    <div className="bg-background overflow-hidden p-6 shadow-xl sm:rounded-lg">
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

                        {hasTransactions ? (
                            <div className="overflow-hidden border border-background-lighter rounded-lg">
                                <MyTransactionTable transactions={transactions.data} />
                                <div className="w-full flex items-center justify-center">
                                    <Paginator pagination={transactions} />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-background flex w-full flex-col items-center justify-center rounded-lg px-4 py-8 mb-10">
                                <RecordsNotFound />
                                <Paragraph className="mt-4 text-center text-dark">
                                    {t('my.noTransactions')}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MyLayout>
    );
}

export default MyTransaction;
