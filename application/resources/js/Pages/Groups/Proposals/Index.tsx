import React from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import MyLayout from "../MyLayout";
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from "../../../../types/paginated-data";

interface ProposalsPageProps {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
}

export default function Proposals({ group, proposals }: ProposalsPageProps) {
    return (
        <MyLayout group={group}>
            <Head title={`${group.name} - Proposals`} />
            
            <WhenVisible data="proposals" fallback={<div>Loading Proposals...</div>}>
                <RelatedProposals
                    proposals={proposals}
                    groupId={group.hash ?? undefined}
                    className='proposals-wrapper w-full grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
                />
            </WhenVisible>
        </MyLayout>
    );
}
