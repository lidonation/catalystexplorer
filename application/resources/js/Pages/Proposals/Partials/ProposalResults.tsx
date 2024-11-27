import React from "react";
import ProposalCard from "@/Pages/Proposals/Partials/ProposalCard";
import ProposalData = App.DataTransferObjects.ProposalData;
interface ProposalProps {
    proposals: ProposalData[];
    isHorizontal: boolean;
    quickPitchView: boolean;
    setGlobalQuickPitchView: (value: boolean) => void;
}


const ProposalResults: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
    setGlobalQuickPitchView,
    quickPitchView
}) => {
    return (
        <div
            className={`grid gap-3 ${isHorizontal
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                }`}
        >
            {proposals &&
                proposals?.map((proposal) => (
                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        isHorizontal={isHorizontal}
                        globalQuickPitchView={quickPitchView}
                        setGlobalQuickPitchView={setGlobalQuickPitchView}
                    />
                ))}
        </div>
    );
};

export default ProposalResults;
