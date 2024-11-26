import React from "react";
import ProposalCard from "@/Pages/Proposals/Partials/ProposalCard";
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: ProposalData[]
}

const ProposalResults: React.FC<ProposalProps> = ({proposals}) => {
    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:max-w-full">
            {proposals &&
                proposals?.map((proposal) => (
                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                    />
                ))}
        </div>
    )
}

export default ProposalResults;
