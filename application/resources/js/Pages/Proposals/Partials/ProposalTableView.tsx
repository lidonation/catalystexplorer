// ProposalTableView.tsx
import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import ProposalTable from './ProposalTable';
import ProposalTableLoading from './ProposalTableLoading';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalTableViewProps {
    proposals: PaginatedData<ProposalData[]>;
    actionType?: 'manage' | 'view';
    disableSorting?: boolean;
    columnVisibility?: {
        fund: boolean;
        proposal: boolean;
        title: boolean;
        yesVotes: boolean;
        abstainVotes: boolean;
        teams: boolean;
    };
}

const ProposalTableView: React.FC<ProposalTableViewProps> = ({
    proposals,
    actionType = 'view',
    disableSorting = true,
    columnVisibility = {
        fund: true,
        proposal: false,
        title: true,
        yesVotes: true,
        abstainVotes: true,
        teams: true
    },
}) => {

    return (
        <>
            <div className="container mt-8">
                <WhenVisible
                    fallback={<ProposalTableLoading />}
                    data="proposals"
                >
                    {proposals?.data.length ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeIn' }}
                        >
                            <ProposalTable
                                actionType={actionType} 
                                disableSorting={disableSorting}
                                proposals={proposals}
                                columnVisibility={columnVisibility}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeIn' }}
                        >
                            <RecordsNotFound context="proposals" />
                        </motion.div>
                    )}
                </WhenVisible>
            </div>
        </>
    );
};

export default ProposalTableView;