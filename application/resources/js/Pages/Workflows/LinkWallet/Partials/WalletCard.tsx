import Button from '@/Components/atoms/Button';
import Card from '@/Components/Card';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CopyIcon from '@/Components/svgs/CopyIcon';
import WalletItem from './WalletItem';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Title from '@/Components/atoms/Title';

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
    isSelected?: boolean;
    onCopy: (value: string) => void;
    copySuccesses: Record<string, boolean>;
    expandedAddresses: Record<string, boolean>;
    onToggleAddressExpansion: (walletId: string) => void;
}

export default function WalletCard({
    wallet,
    onCopy,
    copySuccesses,
    expandedAddresses,
    onToggleAddressExpansion,
}: WalletCardProps) {
    const { t } = useLaravelReactI18n();
    const isExpanded = expandedAddresses[wallet.id];
    const MAX_VISIBLE_ADDRESSES = 2;

    const hasMoreAddresses =
        (wallet?.paymentAddresses?.length || 0) > MAX_VISIBLE_ADDRESSES;
    const visibleAddresses = isExpanded
        ? wallet?.paymentAddresses
        : wallet?.paymentAddresses?.slice(0, MAX_VISIBLE_ADDRESSES);

    const formatWalletName = (name: string) => {
        return name?.charAt(0)?.toUpperCase() + name?.slice(1);
    };
    return (
        <Card>
            <div className="flex w-full flex-col">
                <Title
                    level="4"
                    className="border-content/20 border-b pb-4 font-bold"
                >
                    {formatWalletName(wallet?.name)}
                </Title>
                <div className="border-content/20 grid grid-cols-1 gap-x-10 gap-y-4 border-b py-4 pb-4 lg:grid-cols-2">
                    <WalletItem
                        label={t('my.balance')}
                        value={wallet?.walletDetails?.balance || '0'}
                    />
                    <WalletItem label={t('transactions.drepStatus')}>
                        <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium outline-1 outline-offset-[-1px] ${
                                wallet?.walletDetails?.status
                                    ? 'bg-success/10 text-success outline-success/50'
                                    : 'bg-error/10 text-error outline-error/50'
                            }`}
                        >
                            {wallet?.walletDetails?.status
                                ? 'Active'
                                : 'Inactive'}
                        </span>
                    </WalletItem>
                </div>
                <div className="border-content/20 grid grid-cols-1 gap-x-10 gap-y-4 border-b py-4 lg:grid-cols-2">
                    <WalletItem
                        label={t('transactions.allTimeVotes')}
                        badge
                        value={
                            wallet?.walletDetails
                                ? `${wallet?.walletDetails.all_time_votes.toLocaleString()} votes`
                                : '0 votes'
                        }
                    />
                    <WalletItem
                        label={t('transactions.fundsParticipated')}
                        badge
                        value={
                            wallet?.walletDetails
                                ? (
                                      wallet?.walletDetails.funds_participated
                                          ?.length || 0
                                  ).toString()
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
                            {(wallet?.paymentAddresses?.length || 0) > 0 ? (
                                <>
                                    {visibleAddresses?.map((address, index) => (
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
                                                onToggleAddressExpansion(
                                                    wallet.id,
                                                )
                                            }
                                            className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
                                        >
                                            {isExpanded
                                                ? `Show Less`
                                                : `Show ${(wallet?.paymentAddresses?.length || 0) - MAX_VISIBLE_ADDRESSES} More`}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="flex min-w-0 items-center space-x-2">
                                    <span className="dark:text-content truncate font-mono text-sm font-medium text-slate-800">
                                        {wallet.userAddress}
                                    </span>
                                    <Button
                                        onClick={() =>
                                            onCopy(wallet.userAddress)
                                        }
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
        </Card>
    );
}
