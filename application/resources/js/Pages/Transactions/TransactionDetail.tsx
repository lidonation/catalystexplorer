import Title from '@/Components/atoms/Title';
import Value from '@/Components/atoms/Value';
import RegistrationBadge from '@/Components/RegistrationBadge';
import { copyToClipboard } from '@/utils/copyClipboard';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { truncateMiddle } from '@/utils/truncateMiddle';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, CopyIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DetailRow from './Partials/DetailRow';
import MetadataCard from './Partials/MetadataCard';
import TransactionDetailsCard from './Partials/TransactionDetailsCard';
import UTXOsCard from './Partials/UTXOsCard';
import WalletDetailsCard from './Partials/WalletDetailsCard';
import TransactionData = App.DataTransferObjects.TransactionData;

interface TransactionDetailProps {
    transaction: TransactionData;
    walletStats: {
        all_time_votes: number;
        funds_participated: string[];
    };
}

export default function TransactionDetail({
    transaction,
    walletStats,
}: TransactionDetailProps) {
    const { t } = useTranslation();

    return (
        <>
            <Head title="Transaction" />

            <header className="mt-10">
                <div className="container mx-auto">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
                        <Title level="1" className="text-content lg:text-4xl  text-3xl">
                            {t('transactions.message')}
                        </Title>
                        <div className="inline-block">
                            <RegistrationBadge
                                txType={transaction?.json_metadata?.txType}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto py-4">
                <Link
                    href={useLocalizedRoute('jormungandr.transactions.index')}
                    className="text-primary inline-flex items-center text-sm"
                >
                    <ChevronLeft />
                    <span className="ml-2">{t('back')}</span>
                </Link>
            </div>

            <div className="text-content min-h-screen">
                <div className="container mb-8">
                    <TransactionDetailsCard transaction={transaction} />
                </div>
                <div className="container mb-8">
                    <UTXOsCard transaction={transaction} />
                </div>

                <div className="container mb-8">
                    <WalletDetailsCard
                        transaction={transaction}
                        walletStats={walletStats}
                    >
                        <DetailRow label={t('transactions.stakePub')}>
                            <div className="flex flex-1 items-center">
                                <Value className="text-content mr-2 truncate font-bold">
                                    {truncateMiddle(
                                        transaction.stake_pub ?? '',
                                    )}
                                </Value>
                                {transaction.stake_pub && (
                                    <CopyIcon
                                        className="text-gray-persist h-4 w-4 cursor-pointer font-bold"
                                        onClick={() =>
                                            copyToClipboard(
                                                transaction.stake_pub ?? '',
                                            )
                                        }
                                    />
                                )}
                            </div>
                        </DetailRow>

                        <DetailRow
                            label={t('transactions.paymentAddress')}
                            className="border-none"
                        >
                            <div className="flex flex-1 items-center">
                                <Value className="text-content mr-2 truncate font-bold">
                                    {truncateMiddle(
                                        transaction.json_metadata
                                            .payment_address ?? '',
                                    )}
                                </Value>
                                {transaction.json_metadata.payment_address && (
                                    <CopyIcon
                                        className="text-gray-persist h-4 w-4 cursor-pointer"
                                        onClick={() =>
                                            copyToClipboard(
                                                transaction.json_metadata
                                                    .payment_address ?? '',
                                            )
                                        }
                                    />
                                )}
                            </div>
                        </DetailRow>

                        <Link
                            className="text-primary"
                            href={useLocalizedRoute(
                                'jormungandr.wallets.show',
                                {
                                    stakeKey:
                                        transaction?.json_metadata?.stake_key ??
                                        '-',
                                    catId:
                                        transaction?.json_metadata
                                            ?.voter_delegations[0]?.catId ?? '-',
                                },
                            )}
                        >
                            {t('transactions.view')}
                        </Link>
                    </WalletDetailsCard>
                </div>

                <div className="container mx-auto">
                    <MetadataCard transaction={transaction} />
                </div>
            </div>
        </>
    );
}
