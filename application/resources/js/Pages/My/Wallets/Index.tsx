import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Card from '@/Components/Card';
import Paginator from '@/Components/Paginator';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WalletStats {
    all_time_votes: number;
    stakeAddress: string;
    funds_participated: string[];
    balance: string;
    status?: boolean;
}

interface WalletData {
    id: string;
    name: string;
    networkName: string;
    stakeAddress: string;
    userAddress: string;
    paymentAddresses?: string[];
    walletDetails: WalletStats;
}

interface WalletsPageProps {
    connectedWallets: PaginatedData<WalletData[]>;
    error?: string;
}

const WalletsComponent: React.FC<WalletsPageProps> = ({
    connectedWallets,
    error,
}) => {
    const [copySuccesses, setCopySuccesses] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedAddresses, setExpandedAddresses] = useState<
        Record<string, boolean>
    >({});
    const [deletingWallets, setDeletingWallets] = useState<
        Record<string, boolean>
    >({});
    const { t } = useTranslation();
    const transactionsUrl = useLocalizedRoute('my.transactions');

    const handleDeleteWallet = (wallet: WalletData) => {
        setDeletingWallets((prev) => ({
            ...prev,
            [wallet.stakeAddress]: true,
        }));

        const currentLocale = window.location.pathname.split('/')[1];
        const deleteUrl = `/${currentLocale}/my/wallets/${encodeURIComponent(wallet.stakeAddress)}`;

        router.visit(deleteUrl, {
            method: 'delete',
            onSuccess: () => {},
            onError: (errors) => {
                console.error('Failed to delete wallet:', errors);
                setDeletingWallets((prev) => ({
                    ...prev,
                    [wallet.stakeAddress]: false,
                }));
            },
        });
    };

    const handleCopy = (value: string) => {
        navigator.clipboard.writeText(value).then(() => {
            setCopySuccesses((prev) => ({ ...prev, [value]: true }));
            setTimeout(() => {
                setCopySuccesses((prev) => ({ ...prev, [value]: false }));
            }, 2000);
        });
    };

    const toggleAddressExpansion = (walletId: string) => {
        setExpandedAddresses((prev) => ({
            ...prev,
            [walletId]: !prev[walletId],
        }));
    };

    const formatWalletName = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const hasWallets = connectedWallets?.data?.length > 0;

    return (
        <div className="max-w-8xl mx-auto px-10 py-4 lg:px-16">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-content text-2xl font-semibold">
                        {t('my.myWallets')}
                    </h1>
                    <Paragraph className="text-sm text-slate-500">
                        {t('my.manageWallets')}
                    </Paragraph>
                </div>
                <PrimaryLink
                    className="lg:text-md mb-4 ml-auto px-4 py-2 text-sm text-nowrap"
                    href={useLocalizedRoute('workflows.signature.index', {
                        step: 1,
                    })}
                >
                    {`+ ${t('my.connectWallet')}`}
                </PrimaryLink>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {!hasWallets ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RecordsNotFound />
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {connectedWallets.data.map((wallet) => {
                            const stats = wallet.walletDetails;
                            const paymentAddresses =
                                wallet.paymentAddresses || [];
                            const isExpanded = expandedAddresses[wallet.id];
                            const isDeleting =
                                deletingWallets[wallet.stakeAddress] || false;
                            const MAX_VISIBLE_ADDRESSES = 2;
                            const hasMoreAddresses =
                                paymentAddresses.length > MAX_VISIBLE_ADDRESSES;
                            const visibleAddresses = isExpanded
                                ? paymentAddresses
                                : paymentAddresses.slice(
                                      0,
                                      MAX_VISIBLE_ADDRESSES,
                                  );

                            return (
                                <Card
                                    key={wallet.id}
                                    className={`rounded-xl bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] ${
                                        isDeleting
                                            ? 'pointer-events-none opacity-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex h-14 items-center justify-between border-b border-gray-100 px-5">
                                        <div className="flex items-center space-x-3">
                                            <h2 className="dark:text-content text-base font-semibold text-slate-900">
                                                {formatWalletName(wallet.name)}
                                            </h2>
                                        </div>
                                        <Button
                                            onClick={() =>
                                                handleDeleteWallet(wallet)
                                            }
                                            disabled={isDeleting}
                                            className={`rounded-md px-5 py-2 text-sm font-medium text-white ${
                                                isDeleting
                                                    ? 'cursor-not-allowed bg-gray-400'
                                                    : 'bg-red-500 hover:bg-red-600'
                                            }`}
                                        >
                                            <Paragraph className="text-3 text-white">
                                                {isDeleting
                                                    ? t('my.deleteWallet')
                                                    : t('my.deleteWallet')}
                                            </Paragraph>
                                        </Button>
                                    </div>
                                    <div className="divide-y divide-gray-100 px-5 text-sm">
                                        <div className="grid grid-cols-1 gap-x-10 gap-y-4 py-4 lg:grid-cols-2">
                                            <WalletItem
                                                label={t('my.balance')}
                                                value={stats?.balance}
                                            />
                                            <WalletItem
                                                label={t(
                                                    'transactions.drepStatus',
                                                )}
                                            >
                                                <span
                                                    className={`rounded-md px-2 py-0.5 text-xs font-medium outline outline-1 outline-offset-[-1px] ${
                                                        stats?.status
                                                            ? 'bg-green-100 text-green-600 outline-green-300/50'
                                                            : 'bg-red-100 text-red-600 outline-red-300/50'
                                                    }`}
                                                >
                                                    {stats?.status
                                                        ? 'Active'
                                                        : 'Inactive'}
                                                </span>
                                            </WalletItem>
                                        </div>

                                        <div className="grid grid-cols-1 gap-x-10 gap-y-4 py-4 lg:grid-cols-2">
                                            <WalletItem
                                                label={t(
                                                    'transactions.allTimeVotes',
                                                )}
                                                badge
                                                value={
                                                    stats
                                                        ? `${stats.all_time_votes.toLocaleString()} votes`
                                                        : '0 votes'
                                                }
                                            />
                                            <WalletItem
                                                label={t(
                                                    'transactions.fundsParticipated',
                                                )}
                                                badge
                                                value={
                                                    stats
                                                        ? (
                                                              stats
                                                                  .funds_participated
                                                                  ?.length || 0
                                                          ).toString()
                                                        : '0'
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-x-10 gap-y-4 py-4 lg:grid-cols-2">
                                            <WalletItem
                                                label={
                                                    t(
                                                        'transactions.table.stakeAddress',
                                                    ) || 'Stake Address'
                                                }
                                            >
                                                <div className="flex min-w-0 items-center space-x-2">
                                                    <span className="dark:text-content truncate font-mono text-sm font-medium text-slate-800">
                                                        {wallet.stakeAddress}
                                                    </span>
                                                    {wallet.stakeAddress && (
                                                        <Button
                                                            onClick={() =>
                                                                handleCopy(
                                                                    wallet.stakeAddress,
                                                                )
                                                            }
                                                            className="text-content hover:text-content rounded p-1 hover:bg-gray-100"
                                                        >
                                                            {copySuccesses[
                                                                wallet
                                                                    .stakeAddress
                                                            ] ? (
                                                                <CheckIcon className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <CopyIcon className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            </WalletItem>

                                            <WalletItem
                                                label={`${t('my.paymentAddresses')}`}
                                            >
                                                <div className="space-y-2">
                                                    {paymentAddresses.length >
                                                    0 ? (
                                                        <>
                                                            {visibleAddresses.map(
                                                                (
                                                                    address,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex min-w-0 items-center space-x-2"
                                                                    >
                                                                        <span className="dark:text-content truncate font-mono text-sm font-medium text-slate-800">
                                                                            {
                                                                                address
                                                                            }
                                                                        </span>
                                                                        <Button
                                                                            onClick={() =>
                                                                                handleCopy(
                                                                                    address,
                                                                                )
                                                                            }
                                                                            className="text-content hover:text-content rounded p-1 hover:bg-gray-100"
                                                                        >
                                                                            {copySuccesses[
                                                                                address
                                                                            ] ? (
                                                                                <CheckIcon className="h-4 w-4 text-green-600" />
                                                                            ) : (
                                                                                <CopyIcon className="h-4 w-4" />
                                                                            )}
                                                                        </Button>
                                                                    </div>
                                                                ),
                                                            )}
                                                            {hasMoreAddresses && (
                                                                <Button
                                                                    onClick={() =>
                                                                        toggleAddressExpansion(
                                                                            wallet.id,
                                                                        )
                                                                    }
                                                                    className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                                                                >
                                                                    {isExpanded
                                                                        ? `Show Less`
                                                                        : `Show ${paymentAddresses.length - MAX_VISIBLE_ADDRESSES} More`}
                                                                </Button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="flex min-w-0 items-center space-x-2">
                                                            <span className="dark:text-content truncate font-mono text-sm font-medium text-slate-800">
                                                                {
                                                                    wallet.userAddress
                                                                }
                                                            </span>
                                                            <Button
                                                                onClick={() =>
                                                                    handleCopy(
                                                                        wallet.userAddress,
                                                                    )
                                                                }
                                                                className="text-content-light hover:text-content rounded p-1 hover:bg-gray-100"
                                                            >
                                                                {copySuccesses[
                                                                    wallet
                                                                        .userAddress
                                                                ] ? (
                                                                    <CheckIcon className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <CopyIcon className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </WalletItem>
                                        </div>
                                    </div>

                                    <div className="px-5 py-4">
                                        <Button
                                            onClick={() =>
                                                router.visit(transactionsUrl)
                                            }
                                            className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
                                        >
                                            {t('my.moreWalletsDetails')}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                    <div className="mt-8 w-full">
                        <Paginator pagination={connectedWallets} />
                    </div>
                </>
            )}
        </div>
    );
};

const WalletItem = ({
    label,
    value,
    badge = false,
    children,
    className = '',
}: {
    label: string;
    value?: string;
    badge?: boolean;
    children?: React.ReactNode;
    className?: string;
}) => (
    <div className={`flex min-w-0 items-start ${className}`}>
        <div className="w-32 flex-shrink-0 pt-0.5 text-sm text-slate-500 sm:w-40">
            {label}
        </div>
        <div className="min-w-0 flex-1">
            {children ? (
                children
            ) : badge && value ? (
                <span className="rounded-md bg-gray-50 px-2 py-0.5 text-xs font-medium text-slate-700 outline outline-1 outline-offset-[-1px] outline-gray-200">
                    {value}
                </span>
            ) : (
                <div className="dark:text-content font-medium text-slate-800">
                    {value || <span className="text-slate-400">—</span>}
                </div>
            )}
        </div>
    </div>
);

const Wallets: React.FC<WalletsPageProps> = (props) => {
    return (
        <FiltersProvider defaultFilters={{} as SearchParams}>
            <WalletsComponent {...props} />
        </FiltersProvider>
    );
};

export default Wallets;
