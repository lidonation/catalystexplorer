import { ParamsEnum } from '@/enums/proposal-search-params';
import ProposalMiniCardLoader from '@/Pages/Proposals/Partials/ProposalMiniCardLoader';
import RelatedProposals from '@/Pages/Proposals/Partials/RelatedProposals';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface ProposalsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    proposals: PaginatedData<ProposalData[]>;
}

export default function Proposals({
    ideascaleProfile,
    proposals,
}: ProposalsPageProps) {
    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Proposals`} />

            <WhenVisible data="proposals" fallback={<ProposalMiniCardLoader />}>
                <RelatedProposals
                    proposals={proposals}
                    proposalWrapperClassName="rounded-xl border-2 border-border-dark-on-dark"
                    routeParam={{
                        [ParamsEnum.IDEASCALE_PROFILES]: ideascaleProfile.hash
                            ? [ideascaleProfile.hash]
                            : null,
                    }}
                    className="proposals-wrapper grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
                />
            </WhenVisible>
        </IdeascaleProfileLayout>
    );
}
