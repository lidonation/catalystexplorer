
import { Head, WhenVisible } from '@inertiajs/react';
import CommunityLayout from '../CommunityLayout';
import ProposalMiniCardLoader from '@/Pages/Proposals/Partials/ProposalMiniCardLoader';
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import { PaginatedData } from '../../../../types/paginated-data';
import CommunityData = App.DataTransferObjects.CommunityData
import ProposalsData = App.DataTransferObjects.ProposalData

interface DashboardPageProps {
    community: CommunityData;
    proposals: PaginatedData<ProposalsData[]>;
    ownProposals: number;
    collaboratingProposals: number;
}

export default function Proposals({ community, proposals, ownProposals, collaboratingProposals }: DashboardPageProps) {
    return (
        <CommunityLayout community={community} coProposalsCount={collaboratingProposals} ownProposalsCount={ownProposals}>
            <Head title={`${community?.title} -Proposals`} />

           <WhenVisible data="proposals" fallback={<ProposalMiniCardLoader />}>
                           <RelatedProposals
                                   proposals={proposals}
                                   proposalWrapperClassName='rounded-xl border-2 border-border-dark-on-dark'
                                   communityId={community?.hash ?? ''}
                                   className='proposals-wrapper w-full grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3'
                               />
                       </WhenVisible>
        </CommunityLayout>
    );
}
