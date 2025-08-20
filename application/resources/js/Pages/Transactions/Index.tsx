import Paginator from '@/Components/Paginator';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { FiltersProvider, useFilterContext } from '@/Context/FiltersContext';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useRef, useState } from 'react';
import { CardanoTransactionTable } from './Partials/TransactionTable';
import TransactionsFilters from './Partials/TransactionsFilters';
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
    const { t } = useLaravelReactI18n();
    const [showFilters, setShowFilters] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);


    const typeOptions = [
        { value: '', label: 'Type' },
        { value: 'proposal_payout', label: 'Proposal Payout' },
        { value: 'voter_registration', label: 'Voter Registration' },
    ];

    const selectedOption = typeOptions.find(
        (option) => option.value === (filters.type ?? ''),
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

            <div className="container my-8 lg:my-12">
                <div className="bg-background overflow-hidden border-gray-200 bg-white p-6 shadow-xl sm:rounded-lg">
                    <div className="mb-4 w-full border-gray-200">
                        <Title level="4" className="mb-4 font-bold">
                            {t('transactions.title')}
                        </Title>
                    </div>
                    <hr className="mb-6 border-gray-200" />

                    <div className='mb-4'>
                        <TransactionsFilters />
                    </div>
                    <div className="overflow-hidden rounded-lg border-gray-200 shadow-md">
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
