import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
import ProposalContent from '../Partials/ProposalContent';
import ProposalLayout from '../ProposalLayout';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface IndexProps {
    proposal: App.DataTransferObjects.ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    userCompleteProposalsCount?: number;
    userOutstandingProposalsCount?: number;
    catalystConnectionsCount?: number;
}

const Index = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    userCompleteProposalsCount = 0,
    userOutstandingProposalsCount = 0,
    catalystConnectionsCount = 0,
}: IndexProps) => {
    const { t } = useLaravelReactI18n();

    const isClaimed = proposal?.catalyst_profiles?.some(
        (profile: CatalystProfileData) => profile.claimed_by !== null,
    );

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <div className="bg-background shadow-cx-box-shadow flex flex-col items-start justify-between gap-5 self-stretch rounded-xl p-4 sm:flex-row sm:gap-2 sm:p-6">
                <div className="flex w-120 items-center justify-start gap-4">
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.outstanding')}
                        </div>
                        <div className="text-content text-base">
                            {userOutstandingProposalsCount}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.completed')}
                        </div>
                        <div className="text-content text-base">
                            {userCompleteProposalsCount}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.catalystConnection')}
                        </div>
                        <div className="text-content text-base">
                            {catalystConnectionsCount}
                        </div>
                    </div>
                </div>
            </div>
            {!isClaimed && (
                <div className="bg-background shadow-cx-box-shadow mt-4 flex items-center justify-center rounded-xl p-4">
                    <PrimaryLink
                        href={useLocalizedRoute(
                            'workflows.claimCatalystProfile.index',
                            { step: 1, proposal: proposal.id },
                        )}
                    >
                        {t('workflows.claimCatalystProfile.claim')}
                    </PrimaryLink>
                </div>
            )}
            <ProposalContent content={proposal.content} />
        </ProposalLayout>
    );
};

export default Index;
