import Paginator from '@/Components/Paginator';
import Paragraph from '@/Components/atoms/Paragraph';
import SearchControls from '@/Components/atoms/SearchControls';
import Title from '@/Components/atoms/Title';
import { FiltersProvider } from '@/Context/FiltersContext';
import TransactionSortOptions from '@/lib/TransactionSortOptions';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { useLaravelReactI18n } from "laravel-react-i18n";
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
    const { t } = useLaravelReactI18n();
    const [showFilters, setShowFilters] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const typeOptions = [
        { value: '', label: 'Type' },
        { value: 'proposal_payout', label: 'Proposal Payout' },
        { value: 'voter_registration', label: 'Voter Registration' }
    ];

    const selectedOption = typeOptions.find(option => option.value === (filters.type ?? ''));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                            searchPlaceholder={t('transactions.searchBar.placeholder')}
                        />

                        {/* Transaction Type Filter Dropdown */}
                        {showFilters && (
                            <div className="mt-4">
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            className="w-full rounded border border-black px-3 py-2 text-sm focus:border-black focus:outline-none text-left bg-white flex justify-between items-center"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        >
                                            <span>{selectedOption?.label || 'All Types'}</span>
                                            <svg
                                                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-black rounded shadow-lg">
                                                {typeOptions.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 first:rounded-t last:rounded-b"
                                                        onClick={() => {
                                                            router.get(route(route().current()!), {
                                                                ...filters,
                                                                type: option.value,
                                                            });
                                                            setIsDropdownOpen(false);
                                                        }}
                                                    >
                                                        {option.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <div className="border-gray-200 overflow-hidden rounded-lg shadow-md">
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

