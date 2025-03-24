import { Head } from '@inertiajs/react';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';

interface EventsPageProps {
    community: CommunityData;
}

export default function Proposals({
    community,
}: EventsPageProps) {

    return (
        <CommunityLayout community={community}>
            <Head title={`${community?.title} - Events`} />
            <div>
                <RecordsNotFound/>
            </div>
        </CommunityLayout>
    );
}
