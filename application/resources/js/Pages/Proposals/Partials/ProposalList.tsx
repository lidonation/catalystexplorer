import React from "react";
import ProposalCard from "@/Pages/Proposals/Partials/ProposalCard";
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: ProposalData[];
    isHorizontal: boolean;
}

const ProposalList: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
}) => {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 w-full">
            {proposals &&
                proposals?.map((proposal) => (
                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        isHorizontal={isHorizontal}
                        globalQuickPitchView={false}
                    />
                ))}
        </div>
    )
}

export default ProposalList;
