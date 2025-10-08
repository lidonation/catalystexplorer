import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import Card from '@/Components/Card';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import EditIcon2 from '@/Components/svgs/EditIcon2';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useState, useRef, useEffect } from 'react';

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

interface WalletCardProps {
    wallet: WalletData;
    copySuccesses: Record<string, boolean>;
    expandedAddresses: Record<string, boolean>;
    deletingWallets: Record<string, boolean>;
    updatingWalletNames: Record<string, boolean>;
    onDeleteWallet: (wallet: WalletData) => void;
    onCopy: (value: string) => void;
    onToggleAddressExpansion: (walletId: string) => void;
    onSaveWalletName?: (walletId: string, newName: string) => void;
}

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

const WalletCard: React.FC<WalletCardProps> = ({
    wallet,
    copySuccesses,
    expandedAddresses,
    deletingWallets = {},
    updatingWalletNames ={},
    onDeleteWallet,
    onCopy,
    onToggleAddressExpansion,
    onSaveWalletName,
}) => {
    const { t } = useLaravelReactI18n();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(wallet.name);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const formatWalletName = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const handleStartEdit = () => {
        if (onSaveWalletName && !isUpdatingName) {
            setIsEditingName(true);
            setEditedName(wallet.name);
        }
    };

    const handleSaveName = () => {
        if (editedName.trim() && editedName.trim() !== wallet.name && onSaveWalletName) {
            onSaveWalletName(wallet.id, editedName.trim());
        }
        setIsEditingName(false);
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setEditedName(wallet.name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditingName]);

    const stats = wallet.walletDetails;
    const paymentAddresses = wallet.paymentAddresses || [];
    const isExpanded = expandedAddresses[wallet.id];
    const isDeleting = deletingWallets[wallet.stakeAddress] || false;
    const isUpdatingName = updatingWalletNames[wallet.id] || false;
    const MAX_VISIBLE_ADDRESSES = 2;

    const viewUrl = useLocalizedRoute('my.wallets.show', {
        stakeKey: wallet.stakeAddress,
    });

    const hasMoreAddresses = paymentAddresses.length > MAX_VISIBLE_ADDRESSES;
    const visibleAddresses = isExpanded
        ? paymentAddresses
        : paymentAddresses.slice(0, MAX_VISIBLE_ADDRESSES);

    return (
        <Card
            className={`w-full max-w-full rounded-xl bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] ${
                isDeleting ? 'pointer-events-none opacity-50' : ''
            }`}
        >
            <div className="flex h-14 items-center justify-between border-b border-gray-100 px-5">
                <div className="flex items-center space-x-3">
                    {isEditingName ? (
                        <div className="flex items-center space-x-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSaveName}
                                className="text-base font-semibold text-slate-900 bg-transparent border-b border-cyan-500 outline-none focus:border-cyan-600 px-1 py-1 min-w-0 flex-1"
                                maxLength={50}
                            />
                            <button
                                onClick={handleSaveName}
                                className="text-green-600 hover:text-green-700 p-1"
                                title="Save"
                            >
                                <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Cancel"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <h2 className="dark:text-content text-base font-semibold text-slate-900">
                                {formatWalletName(wallet.name)}
                            </h2>
                            {onSaveWalletName && (
                                <button
                                    onClick={handleStartEdit}
                                    disabled={isUpdatingName}
                                    className={`transition-colors p-1 rounded ${
                                        isUpdatingName 
                                            ? 'text-gray-300 cursor-not-allowed' 
                                            : 'text-gray-400 hover:text-cyan-600'
                                    }`}
                                    title={isUpdatingName ? 'Updating...' : 'Edit wallet name'}
                                >
                                    <EditIcon2 className={`h-4 w-4 ${
                                        isUpdatingName ? 'animate-pulse' : ''
                                    }`} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => onDeleteWallet(wallet)}
                    disabled={isDeleting}
                    className={`lg:text-md mb-4 ml-auto rounded-md px-4 py-2 text-sm font-medium text-nowrap text-white sm:px-2 ${
                        isDeleting
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-red-500 hover:bg-red-600'
                    }`}
                >
                    <Paragraph className="text-3 text-white">
                        {isDeleting ? t('my.deleteWallet') : t('my.deleteWallet')}
                    </Paragraph>
                </Button>
            </div>
            <div className="divide-y divide-gray-100 px-5 text-sm">
                <div className="grid grid-cols-1 gap-x-10 gap-y-4 py-4 lg:grid-cols-2">
                    <WalletItem label={t('my.balance')} value={stats?.balance} />
                    <WalletItem label={t('transactions.drepStatus')}>
                        <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium outline outline-1 outline-offset-[-1px] ${
                                stats?.status
                                    ? 'bg-green-100 text-green-600 outline-green-300/50'
                                    : 'bg-red-100 text-red-600 outline-red-300/50'
                            }`}
                        >
                            {stats?.status ? 'Active' : 'Inactive'}
                        </span>
                    </WalletItem>
                </div>

                <div className="grid grid-cols-1 gap-x-10 gap-y-4 py-4 lg:grid-cols-2">
                    <WalletItem
                        label={t('transactions.allTimeVotes')}
                        badge
                        value={
                            stats
                                ? `${stats.all_time_votes.toLocaleString()} votes`
                                : '0 votes'
                        }
                    />
                    <WalletItem
                        label={t('transactions.fundsParticipated')}
                        badge
                        value={
                            stats
                                ? (stats.funds_participated?.length || 0).toString()
                                : '0'
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-x-10 gap-y-4 py-4 lg:grid-cols-2">
                    <WalletItem label={t('transactions.table.stakeAddress')}>
                        <div className="flex min-w-0 items-center space-x-2">
                            <span className="dark:text-content truncate font-mono text-sm font-medium text-slate-800">
                                {wallet.stakeAddress}
                            </span>
                            {wallet.stakeAddress && (
                                <Button
                                    onClick={() => onCopy(wallet.stakeAddress)}
                                    className="text-content hover:text-content rounded p-1 hover:bg-gray-100"
                                >
                                    {copySuccesses[wallet.stakeAddress] ? (
                                        <CheckIcon className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <CopyIcon className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </WalletItem>

                    <WalletItem label={`${t('my.paymentAddresses')}`}>
                        <div className="space-y-2">
                            {paymentAddresses.length > 0 ? (
                                <>
                                    {visibleAddresses.map((address, index) => (
                                        <div
                                            key={index}
                                            className="flex min-w-0 items-center space-x-2"
                                        >
                                            <span className="dark:text-content truncate font-mono text-sm font-medium text-slate-800">
                                                {address}
                                            </span>
                                            <Button
                                                onClick={() => onCopy(address)}
                                                className="text-content hover:text-content rounded p-1 hover:bg-gray-100"
                                            >
                                                {copySuccesses[address] ? (
                                                    <CheckIcon className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <CopyIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                    {hasMoreAddresses && (
                                        <Button
                                            onClick={() =>
                                                onToggleAddressExpansion(wallet.id)
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
                                        {wallet.userAddress}
                                    </span>
                                    <Button
                                        onClick={() => onCopy(wallet.userAddress)}
                                        className="text-content-light rounded p-1"
                                    >
                                        {copySuccesses[wallet.userAddress] ? (
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
                    onClick={() => {
                        router.visit(viewUrl);
                    }}
                    className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
                >
                    {t('my.moreWalletsDetails')}
                </Button>
            </div>
        </Card>
    );
};

export default WalletCard;
