import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { Head } from '@inertiajs/react';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData;

interface EventsPageProps {
    community: CommunityData;
    ownProposals: number;
    coProposals: number;
}

export default function Proposals({
    community,
    ownProposals,
    coProposals,
}: EventsPageProps) {
    return (
        <CommunityLayout
            community={community}
            ownProposalsCount={ownProposals}
            coProposalsCount={coProposals}
        >
            <Head title={`${community?.title} - Events`} />
            <div>
                <RecordsNotFound />
            </div>
        </CommunityLayout>
    );
}
