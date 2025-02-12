import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProposalCard from '@/Pages/Proposals/Partials/ProposalCard';
import ProposalCardMini from './ProposalCardMini';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals?: ProposalData[];
    isHorizontal: boolean;
    quickPitchView: boolean;
    isMini: boolean;
    setGlobalQuickPitchView: (value: boolean) => void;
    searchTerm?: string;
}

const ProposalResults: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
    setGlobalQuickPitchView,
    quickPitchView,
    isMini,
    searchTerm = ''
}) => {
    if (!proposals?.length) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeIn' }}
            >
                <RecordsNotFound
                    context="proposals"
                    searchTerm={searchTerm}
                />
            </motion.div>
        );
    }

    return (
        <div
            className={`grid gap-3 ${
                isHorizontal
                    ? 'grid-cols-1'
                    : `${isMini ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`
            }`}
        >
            <AnimatePresence>
                {proposals.map((proposal) => (
                    <motion.div
                        key={`${proposal.hash}-${isMini ? 'mini' : 'full'}`}
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
                                setGlobalQuickPitchView={setGlobalQuickPitchView}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ProposalResults;
