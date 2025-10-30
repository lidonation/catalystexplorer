import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import WalletCard from '@/Pages/Workflows/LinkWallet/Partials/WalletCard';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';

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

interface WalletsSectionProps {
    linkedWallet: WalletData;
    onCopy: (value: string) => void;
    copySuccesses: Record<string, boolean>;
    expandedAddresses: Record<string, boolean>;
    onToggleAddressExpansion: (walletId: string) => void;
    proposalId?: string;
    moreThanOneWallet?: boolean;
}

export default function WalletsSection({
    linkedWallet,
    onCopy,
    copySuccesses,
    expandedAddresses,
    onToggleAddressExpansion,
    proposalId,
    moreThanOneWallet,
}: WalletsSectionProps) {
    const { t } = useLaravelReactI18n();
    return (
        <Card className="bg-background p-6">
            <Title level="4" className="mb-6 font-semibold">
                {t('proposal.linkedWallets.title')}
            </Title>
            <WalletCard
                key={linkedWallet?.id}
                wallet={linkedWallet}
                copySuccesses={copySuccesses}
                onCopy={onCopy}
                expandedAddresses={expandedAddresses}
                onToggleAddressExpansion={onToggleAddressExpansion}
            />
            {moreThanOneWallet && (
                <PrimaryLink
                    href={useLocalizedRoute('workflows.linkWallet.index', {
                        step: 1,
                        proposal: proposalId,
                    })}
                    className="mt-6 block w-full text-center"
                >
                    {t('workflows.linkWallet.linkDifferentWallet')}
                </PrimaryLink>
            )}
        </Card>
    );
}
