
import { Head } from '@inertiajs/react';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData

interface DashboardPageProps {
    community: CommunityData
}

export default function Proposals({ community }: DashboardPageProps) {
    return (
        <CommunityLayout community={community}>
            <Head title={`${community?.title} - Dashboard`} />

        
        </CommunityLayout>
    );
}
