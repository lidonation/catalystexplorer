import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Card from '@/Components/Card';
import { PaginatedData } from '@/types/paginated-data';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import ProposalMetadataWidget from './partials/ProposalMetadataWidget';
import QuickPitchWidget from './partials/QuickPitchWidget';
import WalletsSection from './partials/WalletsSection';
import ShareConfigurator from './partials/ShareCard/ShareCardConfigurator';

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
interface ManageProposalProps {
    proposal: App.DataTransferObjects.ProposalData;
    quickpitchMetadata?: {
        thumbnail: string;
        views: number;
        likes: number;
        comments: number;
        favoriteCount: number;
        duration?: number;
    } | null;
    linkedWallet?: WalletData;
    hasMoreThanOneWallet?: boolean;
}

export default function ManageProposal({
    proposal,
    quickpitchMetadata,
    linkedWallet,
    hasMoreThanOneWallet,
}: ManageProposalProps) {
    const [copySuccesses, setCopySuccesses] = useState<Record<string, boolean>>(
        {},
    );
    const [expandedAddresses, setExpandedAddresses] = useState<
        Record<string, boolean>
    >({});
    const { t } = useLaravelReactI18n();

    const proposalUrl = useLocalizedRoute('proposals.proposal.details', {
        slug: proposal?.slug,
    });
    
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
    return (
        <div>
            <Head title={t('proposals.manageProposal')} />

            <div className="container py-8">
                <div className="mx-auto">
                    <div className="mb-8">
                        <h1 className="text-content mb-2 text-2xl font-bold">
                            {t('proposals.managingProposal', {
                                title: proposal.title ?? '---',
                            })}
                        </h1>
                        <p className="text-content/60">
                            {t('proposals.manageDescription')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
                        <div className="grid w-full grid-cols-1 gap-6">
                            <ProposalMetadataWidget proposal={proposal} />

                            {linkedWallet ? (
                                <WalletsSection
                                    linkedWallet={linkedWallet}
                                    onCopy={handleCopy}
                                    copySuccesses={copySuccesses}
                                    expandedAddresses={expandedAddresses}
                                    onToggleAddressExpansion={
                                        toggleAddressExpansion
                                    }
                                    moreThanOneWallet={hasMoreThanOneWallet}
                                    proposalId={proposal?.id}
                                />
                            ) : (
                                <Card className="mt-4 bg-background">
                                    <PrimaryLink
                                        href={useLocalizedRoute(
                                            'workflows.linkWallet.index',
                                            {
                                                step: 1,
                                                proposal: proposal?.id,
                                            },
                                        )}
                                    >
                                        {t('Link wallet')}
                                    </PrimaryLink>
                                </Card>
                            )}
                        </div>
                        <div className="flex w-full flex-col gap-6">
                            <QuickPitchWidget
                                proposal={proposal}
                                quickpitchMetadata={quickpitchMetadata ?? null}
                            />
                            <ShareConfigurator
                                proposal={proposal}
                                proposalUrl={proposalUrl}
                            />
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
