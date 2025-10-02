import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Paginator from '@/Components/Paginator';
import { FiltersProvider } from '@/Context/FiltersContext';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { SearchParams } from '@/types/search-params';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState } from 'react';
import WalletCard from './Partials/WalletCard';

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
    catId: string;
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
    const [updatingWalletNames, setUpdatingWalletNames] = useState<
        Record<string, boolean>
    >({});
    const { t } = useLaravelReactI18n();

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

    const handleSaveWalletName = (walletId: string, newName: string) => {
        // Set loading state for this specific wallet
        setUpdatingWalletNames((prev) => ({
            ...prev,
            [walletId]: true,
        }));
        
        // Create the update URL following the same pattern as other routes
        const currentLocale = window.location.pathname.split('/')[1];
        const updateUrl = `/${currentLocale}/my/wallets/${walletId}`;
        
        // Make PATCH request to update the wallet name
        router.patch(updateUrl, 
            { name: newName },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // The page will automatically refresh with the new data from the server
                    // No additional client-side state updates needed as Inertia handles this
                },
                onError: (errors) => {
                    console.error('Failed to update wallet name:', errors);
                    // You could add user-facing error handling here if needed
                    // For example, showing a toast notification or error message
                },
                onFinish: () => {
                    // Clear loading state
                    setUpdatingWalletNames((prev) => ({
                        ...prev,
                        [walletId]: false,
                    }));
                }
            }
        );
    };


    const hasWallets = connectedWallets?.data?.length > 0;
    
    return (
        <div className="w-full max-w-full px-4 py-4">
            <Head title={t('my.myWallets')} />

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
                    <Paragraph className="text-red-800">{error}</Paragraph>
                </div>
            )}

            {!hasWallets ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RecordsNotFound />
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {connectedWallets.data.map((wallet) => (
                            <WalletCard
                                key={wallet.id}
                                wallet={wallet}
                                copySuccesses={copySuccesses}
                                expandedAddresses={expandedAddresses}
                                deletingWallets={deletingWallets}
                                updatingWalletNames={updatingWalletNames}
                                onDeleteWallet={handleDeleteWallet}
                                onCopy={handleCopy}
                                onToggleAddressExpansion={toggleAddressExpansion}
                                onSaveWalletName={handleSaveWalletName}
                            />
                        ))}
                    </div>
                    <div className="mt-8 w-full">
                        <Paginator pagination={connectedWallets} />
                    </div>
                </>
            )}
        </div>
    );
};


const Wallets: React.FC<WalletsPageProps> = (props) => {
    return (
        <FiltersProvider defaultFilters={{} as SearchParams}>
            <WalletsComponent {...props} />
        </FiltersProvider>
    );
};

export default Wallets;
