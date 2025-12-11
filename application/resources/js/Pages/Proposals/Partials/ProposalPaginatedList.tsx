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
    disableInertiaLoading?: boolean; // Disable WhenVisible loading for streaming data
}

const ProposalPaginatedList: React.FC<ProposalProps> = ({
    proposals,
    isHorizontal,
    quickPitchView,
    setQuickPitchView,
    isMini,
    disableInertiaLoading = false,
}) => {
    return (
        <>
            <section className="proposals-wrapper container mt-3 w-full pb-8 px-0">
                {disableInertiaLoading ? (
                    // Direct render without WhenVisible for streaming data
                    proposals?.data.length ? (
                        <div
                            className="py-4"
                            data-testid="proposal-results-container"
                        >
                            <ProposalResults
                                proposals={proposals?.data}
                                isHorizontal={isHorizontal}
                                quickPitchView={quickPitchView}
                                setGlobalQuickPitchView={setQuickPitchView}
                                isMini={isMini}
                            />
                        </div>
                    ) : (
                        <div className="mb-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeIn' }}
                            >
                                <RecordsNotFound context="proposals" />
                            </motion.div>
                        </div>
                    )
                ) : (
                    // Use WhenVisible for normal Inertia loading
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
                        {proposals?.data.length ? (
                            <div
                                className="py-4"
                                data-testid="proposal-results-container"
                            >
                                <ProposalResults
                                    proposals={proposals?.data}
                                    isHorizontal={isHorizontal}
                                    quickPitchView={quickPitchView}
                                    setGlobalQuickPitchView={setQuickPitchView}
                                    isMini={isMini}
                                />
                            </div>
                        ) : (
                            <div className="mb-8">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4, ease: 'easeIn' }}
                                >
                                    <RecordsNotFound context="proposals" />
                                </motion.div>
                            </div>
                        )}
                    </WhenVisible>
                )}
            </section>
            <section
                className="container"
                data-testid="proposal-paginator-container"
            >
                {proposals && <Paginator pagination={proposals} />}
            </section>
        </>
    );
};

export default ProposalPaginatedList;
