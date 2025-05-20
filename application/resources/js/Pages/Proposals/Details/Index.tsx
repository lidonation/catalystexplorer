import { useTranslation } from "react-i18next";
import ProposalLayout from "../ProposalLayout";
import ProposalContent from "../Partials/ProposalContent";

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
    catalystConnectionsCount = 0
}: IndexProps) => {
    const { t } = useTranslation();

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
        >
            <div className="self-stretch p-4 sm:p-6 bg-background rounded-xl shadow-[0px_1px_4px_0px_rgba(16,24,40,0.10)] flex flex-col sm:flex-row justify-between items-start gap-5 sm:gap-2">
                <div className="w-120 flex justify-start items-center gap-4">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                        <div className="text-gray-persist text-sm">{t('proposals.outstanding')}</div>
                        <div className="text-content text-base">{userOutstandingProposalsCount}</div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                        <div className="text-gray-persist text-sm">{t('proposals.completed')}</div>
                        <div className="text-content text-base">{userCompleteProposalsCount}</div>
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1">
                        <div className="text-gray-persist text-sm">{t('proposals.catalystConnection')}</div>
                        <div className="text-content text-base">{catalystConnectionsCount}</div>
                    </div>
                </div>
            </div>
            <ProposalContent content={proposal.content} />
        </ProposalLayout>
    );
};

export default Index;
