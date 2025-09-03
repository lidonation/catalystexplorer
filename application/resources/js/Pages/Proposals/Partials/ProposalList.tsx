import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import React from 'react';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: ProposalData[];
    proposalAttrs?: {};
    isHorizontal?: boolean;
}

const ProposalList: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal = false,
    proposalAttrs = {},
}) => {
    return (
        <div
            className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            data-testid="proposal-list"
        >
            {proposals &&
                proposals?.map((proposal) => (
                    <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        isHorizontal={isHorizontal}
                        globalQuickPitchView={false}
                        proposalAttrs={proposalAttrs}
                    />
                ))}
        </div>
    );
};

export default ProposalList;
