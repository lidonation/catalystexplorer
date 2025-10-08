import Card from '@/Components/Card';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalMetadataWidget from './partials/ProposalMetadataWidget';
import QuickPitchWidget from './partials/QuickPitchWidget';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';

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
}

export default function ManageProposal({
    proposal,
    quickpitchMetadata,
}: ManageProposalProps) {
    const { t } = useLaravelReactI18n();
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

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="w-full">
                            <ProposalMetadataWidget proposal={proposal} />
                            <Card className="mt-4">
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
                        </div>
                        <div className="w-full">
                            <QuickPitchWidget
                                proposal={proposal}
                                quickpitchMetadata={quickpitchMetadata ?? null}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
