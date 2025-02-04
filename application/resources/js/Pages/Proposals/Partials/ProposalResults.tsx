import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import ProposalCardMini from './ProposalCardMini';
import ProposalData = App.DataTransferObjects.ProposalData;
interface ProposalProps {
    proposals?: ProposalData[];
    isHorizontal: boolean;
    quickPitchView: boolean;
    isMini: boolean;
    isMini: boolean;
    setGlobalQuickPitchView: (value: boolean) => void;
}

const ProposalResults: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
    setGlobalQuickPitchView,
    quickPitchView,
    isMini,
    isMini,
}) => {
    return (
        <div
            className={`grid gap-3 ${
                isHorizontal
                    ? 'grid-cols-1'
                    : `${isMini ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`
            }`}
        >
            <AnimatePresence>
                {proposals &&
                    proposals?.map((proposal) => (
                        <motion.div
                            key={`${proposal.id}-${isMini ? 'mini' : 'full'}`} 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 0.9 }} 
                            transition={{ duration: 0.4, ease: 'easeIn' }} 
                        >
                            {isMini ? (
                                <ProposalCardMini
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
                        </motion.div>
                    ))}
            </AnimatePresence>
        </div>
    );
};

export default ProposalResults;
