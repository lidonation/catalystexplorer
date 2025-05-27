import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';
import GroupCardLoader from '@/Pages/Groups/Partials/GroupCardMiniLoader';
import { Head, WhenVisible } from '@inertiajs/react';
import { PaginatedData } from '@/types/paginated-data';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData;
import GroupData = App.DataTransferObjects.GroupData;

interface DashboardPageProps {
    community: CommunityData;
    groups: PaginatedData<GroupData[]>;
    ownProposals: number;
    collaboratingProposals: number;
}

export default function Groups({
    community,
    groups,
    ownProposals,
    collaboratingProposals,
}: DashboardPageProps) {
    return (
        <CommunityLayout
            community={community}
            ownProposalsCount={ownProposals}
            coProposalsCount={collaboratingProposals}
        >
            <Head title={`${community?.title} -Groups`} />

            <WhenVisible data="groups" fallback={<GroupCardLoader />}>
                <div className="w-full overflow-auto">
                    {typeof groups?.data !== 'undefined' && (
                        <div className="grid grid-cols-2 gap-4">
                            {groups?.data.map((group) => (
                                <div className="border-border-dark-on-dark rounded-lg border-2">
                                    <GroupCardExtended
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
