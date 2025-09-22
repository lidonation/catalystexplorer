import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
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
    userHasProfileInProposal?: boolean;
    isInActiveFund?: boolean;
}

const Index = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    userCompleteProposalsCount = 0,
    userOutstandingProposalsCount = 0,
    catalystConnectionsCount = 0,
    userHasProfileInProposal = false,
    isInActiveFund = false,
}: IndexProps) => {
    const { t } = useLaravelReactI18n();

    const isClaimed = proposal?.is_claimed === true;

    const canCreateQuickPitch =
        !proposal?.quickpitch &&
        userHasProfileInProposal &&
        isInActiveFund

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <div className="bg-background shadow-cx-box-shadow flex flex-col items-start justify-between gap-5 self-stretch overflow-x-auto rounded-xl p-4 sm:flex-row sm:gap-2 sm:p-6">
                <div className="flex w-120 items-center justify-start gap-4 overflow-x-auto">
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.outstanding')}
                        </div>
                        <div className="text-content text-base">
                            {userOutstandingProposalsCount &&
                            userOutstandingProposalsCount > 0
                                ? userOutstandingProposalsCount
                                : '-'}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.completed')}
                        </div>
                        <div className="text-content text-base">
                            {userCompleteProposalsCount &&
                            userCompleteProposalsCount > 0
                                ? userCompleteProposalsCount
                                : '-'}
                        </div>
                    </div>
                    <div className="inline-flex flex-1 flex-col items-start justify-start gap-1">
                        <div className="text-gray-persist text-sm">
                            {t('proposals.catalystConnection')}
                        </div>
                        <div className="text-content text-base">
                            {catalystConnectionsCount &&
                            catalystConnectionsCount > 0
                                ? catalystConnectionsCount
                                : '-'}
                        </div>
                    </div>
                </div>
            </div>
            {canCreateQuickPitch && (
                <div className="bg-background shadow-cx-box-shadow mt-4 flex items-center justify-center rounded-xl p-4">
                    <PrimaryLink
                        href={useLocalizedRoute('my.proposals.manage', {
                            proposal: proposal.id,
                        })}
                    >
                        {t('widgets.quickPitch.add')}
                    </PrimaryLink>
                </div>
            )}
            {!isClaimed && (
                <div className="bg-background shadow-cx-box-shadow mt-4 flex flex-row items-center justify-center gap-2 rounded-xl p-4">
                    <PrimaryLink
                        href={useLocalizedRoute(
                            'workflows.claimCatalystProfile.index',
                            { step: 1, proposal: proposal.id },
                        )}
                    >
                        {t('workflows.claimCatalystProfile.claim')}
                    </PrimaryLink>
                    <Paragraph className="text-content/50 mt-2 flex items-center">
                        {isInActiveFund
                            ? t('widgets.quickPitch.disclaimer')
                            : ''}
                    </Paragraph>
                </div>
            )}

            <ProposalContent content={proposal.content} />
        </ProposalLayout>
    );
};

export default Index;
