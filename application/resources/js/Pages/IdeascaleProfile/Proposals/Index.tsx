import React from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from "../../../../types/paginated-data";
import ProposalMiniCardLoader from "@/Pages/Proposals/Partials/ProposalMiniCardLoader";
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';

interface ProposalsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    proposals: PaginatedData<ProposalData[]>;
}

export default function Proposals({ ideascaleProfile, proposals }: ProposalsPageProps) {
    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Proposals`} />

            <WhenVisible data="proposals" fallback={<ProposalMiniCardLoader />}>
                <RelatedProposals
                        proposals={proposals}
                        proposalWrapperClassName='rounded-lg border-2 border-border-dark-on-dark'
                        ideascaleProfileId={ideascaleProfile.hash?? undefined}
                        className='proposals-wrapper w-full grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
                    />
            </WhenVisible>
        </IdeascaleProfileLayout>
    );
}
