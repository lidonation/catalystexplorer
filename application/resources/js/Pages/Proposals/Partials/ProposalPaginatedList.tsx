import Paginator from '@/Components/Paginator';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading';
import { WhenVisible } from '@inertiajs/react';
import React from 'react';
import ProposalHorizontalCardLoading from './ProposalHorizontalCardLoading';
import ProposalResults from './ProposalResults';
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from '@/types/paginated-data';

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
            <section className="w-full px-4 lg:container lg:px-0">
                {proposals && <Paginator pagination={proposals} />}
            </section>
        </>
    );
};

export default ProposalPaginatedList;
