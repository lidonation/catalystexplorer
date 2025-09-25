import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import QuickPitchWidget from './partials/QuickPitchWidget';
import ProposalMetadataWidget from './partials/ProposalMetadataWidget';

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
                        <h1 className="mb-2 text-2xl font-bold text-content">
                            {t('proposals.managingProposal', {
                                title: proposal.title ?? '---',
                            })}
                        </h1>
                        <p className="text-content/60">
                            {t('proposals.manageDescription')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                        <div className='w-full'>
                            <ProposalMetadataWidget proposal={proposal} />
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
