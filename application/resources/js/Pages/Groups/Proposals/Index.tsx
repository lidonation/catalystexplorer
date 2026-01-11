import ProposalMiniCardLoader from '@/Pages/Proposals/Partials/ProposalMiniCardLoader';
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import { ParamsEnum } from '@/enums/proposal-search-params';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import GroupLayout from '../GroupLayout';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalsPageProps {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]> | undefined;
}

export default function Proposals({ group, proposals }: ProposalsPageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Proposals`} />

            <WhenVisible data="proposals" fallback={<ProposalMiniCardLoader />}>
                <RelatedProposals
                    proposals={proposals}
                    routeParam={{
                        [ParamsEnum.GROUPS]: group.id ? [group.id] : null,
                    }}
                    proposalWrapperClassName="rounded-xl border-2 border-border-dark-on-dark"
                    className="proposals-wrapper grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
                />
            </WhenVisible>
        </GroupLayout>
    );
}
