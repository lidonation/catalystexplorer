import React from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import GroupLayout from "../GroupLayout";
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from "../../../../types/paginated-data";
import ProposalMiniCardLoader from "@/Pages/Proposals/Partials/ProposalMiniCardLoader";

interface ProposalsPageProps {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
}

export default function Proposals({ group, proposals }: ProposalsPageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Proposals`} />

            <WhenVisible data="proposals" fallback={<ProposalMiniCardLoader />}>
                <RelatedProposals
                    proposals={proposals}
                    groupId={group.hash ?? undefined}
                    proposalWrapperClassName='rounded-lg border-2 border-border-dark-on-dark'
                    className='proposals-wrapper w-full grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
                />
            </WhenVisible>
        </GroupLayout>
    );
}
