import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';
import ProposalHorizontalCardLoading from './ProposalHorizontalCardLoading';
import ProposalResults from './ProposalResults';
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalProps {
    proposals: PaginatedData<ProposalData[]>;
    isHorizontal: boolean;
    quickPitchView?: boolean;
    setQuickPitchView?: (value: boolean) => void;
    isMini: boolean;
}

const ProposalPaginatedList: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
    quickPitchView,
    setQuickPitchView,
    isMini,
}) => {
    if (!proposals?.data.length) {
        return (
            <div className="container mb-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeIn' }}
                >
                    <RecordsNotFound context="proposals" />
                </motion.div>
            </div>
        );
    }
    return (
        <>
            <section className="proposals-wrapper container mt-3 w-full pb-8">
                <WhenVisible
                    fallback={
                        isHorizontal ? (
                            <ProposalHorizontalCardLoading />
                        ) : (
                            <VerticalCardLoading />
                        )
                    }
                    data="proposals"
                >
                    <div className="py-4">
                        <ProposalResults
                            proposals={proposals?.data}
                            isHorizontal={isHorizontal}
                            quickPitchView={quickPitchView}
                            setGlobalQuickPitchView={setQuickPitchView}
                            isMini={isMini}
                        />
                    </div>
                </WhenVisible>
            </section>
            <section className="container w-full px-4 lg:px-0">
                {proposals && <Paginator pagination={proposals} />}
            </section>
        </>
    );
};

export default ProposalPaginatedList;
