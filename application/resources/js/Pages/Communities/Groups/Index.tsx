import GroupList from '@/Pages/Groups/Partials/GroupList';
import ProposalMiniCardLoader from '@/Pages/Proposals/Partials/ProposalMiniCardLoader';
import { Head, WhenVisible } from '@inertiajs/react';
import { PaginatedData } from '../../../../types/paginated-data';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData;
import GroupData = App.DataTransferObjects.GroupData;
import GroupCardLoader from '@/Pages/Groups/Partials/GroupCardMiniLoader';
import GroupCard from '@/Pages/Groups/Partials/GroupCard';

interface DashboardPageProps {
    community: CommunityData;
    groups: PaginatedData<GroupData[]>;
    ownProposals: number;
    collaboratingProposals: number;
}

export default function Groups({ community, groups, ownProposals, collaboratingProposals }: DashboardPageProps) {
    return (
        <CommunityLayout community={community} ownProposalsCount={ownProposals} coProposalsCount={collaboratingProposals}>
            <Head title={`${community?.title} -Groups`} />

            <WhenVisible data="groups" fallback={<GroupCardLoader />}>
            <div className="w-full overflow-auto">
                            {typeof groups?.data !== 'undefined' && (
                                <div className="grid grid-cols-2 gap-4">
                                    {groups?.data.map((group) => (
                                        <div className="border-border-dark-on-dark rounded-lg border-2">
                                            <GroupCard
                                                key={group?.hash}
                                                group={group}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
            </WhenVisible>
        </CommunityLayout>
    );
}
