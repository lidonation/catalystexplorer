import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import Card from '@/Components/Card';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import { copyToClipboard } from '@/utils/copyClipboard';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, CopyIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../types/paginated-data';
import { SearchParams } from '../../../types/search-params';
import DetailRow from './Partials/DetailRow';
import WalletDetailsCard from './Partials/WalletDetailsCard';
import WalletTransactionsTable from './Partials/WalletTransactionsTable';
import TransactionData = App.DataTransferObjects.TransactionData;
import VoterHistoryData = App.DataTransferObjects.VoterHistoryData;
import CatalystVotesTable from './Partials/CatalystVotesTable';

interface WalletProps {
    transaction: TransactionData;
    walletTransactions: PaginatedData<TransactionData[]>;
    catalystVotes: PaginatedData<VoterHistoryData[]>;
    walletStats: {
        all_time_votes: number;
        funds_participated: string[];
    };
    filters: SearchParams;
}
export default function Wallet({
    walletStats,
    transaction,
    catalystVotes,
    walletTransactions,
    filters,
}: WalletProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('votes');

    return (
        <>
            <FiltersProvider defaultFilters={filters}>
                <Head title="Wallet" />
                <header className="mt-10">
                    <div className="container mx-auto">
                        <Title level="1" className="text-content text-4xl">
                            {t('transactions.wallet.title')}
                        </Title>
                    </div>
                </header>
                <div className="container mx-auto py-4">
                    <Link
                        href={useLocalizedRoute(
                            'jormungandr.transactions.index',
                            {
                                transaction: transaction?.tx_hash,
                            },
                        )}
                        className="text-primary inline-flex items-center text-sm"
                    >
                        <ChevronLeft />
                        <span className="ml-2">{t('back')}</span>
                    </Link>
                </div>
                <div className="container mb-8">
                    <WalletDetailsCard
                        transaction={transaction}
                        walletStats={walletStats}
                        title={t('transactions.wallet.wallet')}
                    >
                        <DetailRow label={t('transactions.wallet.stakeKey')}>
                            <div className="flex flex-1 items-center">
                                <Value className="text-content mr-2 truncate font-bold">
                                    {truncateMiddle(
                                        transaction?.json_metadata?.stake_key,
                                    )}
                                </Value>
                                <CopyIcon
                                    className="text-gray-persist h-4 w-4 cursor-pointer font-bold"
                                    onClick={() =>
                                        copyToClipboard(
                                            transaction?.json_metadata
                                                .stake_key,
                                        )
                                    }
                                />
                            </div>
                        </DetailRow>
                    </WalletDetailsCard>
                </div>
                <div className="container mb-8">
                    <Card>
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    className={`border-b-2 px-1 py-4 text-sm font-medium cursor-pointer ${
                                        activeTab === 'votes'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-persist'
                                    }`}
                                    onClick={() => setActiveTab('votes')}
                                >
                                    {t('transactions.wallet.catalystVotes')}
                                </button>
                                <button
                                    className={`border-b-2 px-1 py-4 text-sm font-medium cursor-pointer ${
                                        activeTab === 'transactions'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-persist'
                                    }`}
                                    onClick={() => setActiveTab('transactions')}
                                >
                                    {t('transactions.wallet.transactions')}
                                </button>
                            </nav>
                        </div>
                        <div className="py-4">
                            {activeTab === 'votes' ? (
                                <>
                                    <CatalystVotesTable
                                        catalystVotes={catalystVotes?.data}
                                    />
                                    <div className="flex w-full items-center justify-center pt-2 bg-background rounded-b-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                                        <div className='mt-2'>
                                        {catalystVotes && (
                                            <Paginator
                                                pagination={catalystVotes}
                                            />
                                        )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <WalletTransactionsTable
                                        transactions={walletTransactions.data}
                                    />
                                    <div className="flex w-full items-center justify-center pt-2 bg-background rounded-b-lg shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
                                        <div className='mt-2'>
                                        {walletTransactions && (
                                            <Paginator
                                                pagination={walletTransactions}
                                            />
                                        )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </FiltersProvider>
        </>
    );
}
