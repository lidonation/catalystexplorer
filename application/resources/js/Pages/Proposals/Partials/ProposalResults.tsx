import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import ProposalMiniCard from '@/Pages/Proposals/Partials/ProposalMiniCard';
import React from 'react';
import ProposalData = App.DataTransferObjects.ProposalData;
interface ProposalProps {
    proposals?: ProposalData[];
    isHorizontal: boolean;
    quickPitchView: boolean;
    isMini: boolean;
    setGlobalQuickPitchView: (value: boolean) => void;
}

const ProposalResults: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
    setGlobalQuickPitchView,
    quickPitchView,
    isMini,
}) => {
    return (
        <div
            className={`grid gap-3 ${
                isHorizontal
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            }`}
        >
            {proposals &&
                proposals.map((proposal) => (
                    <div key={proposal.id}>
                        {isMini ? (
                            <ProposalMiniCard
                                proposal={proposal}
                                isHorizontal={false}
                            />
                        ) : (
                            <ProposalCard
                                proposal={proposal}
                                isHorizontal={isHorizontal}
                                globalQuickPitchView={quickPitchView}
                                setGlobalQuickPitchView={
                                    setGlobalQuickPitchView
                                }
                            />
                        )}
                    </div>
                ))}
        </div>
    );
};

export default ProposalResults;
