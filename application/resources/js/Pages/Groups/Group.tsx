import { PaginatedData } from '@/types/paginated-data';
import { Head } from '@inertiajs/react';
import GroupLayout from './GroupLayout';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import LocationData = App.DataTransferObjects.LocationData;
import ConnectionData = App.DataTransferObjects.ConnectionData;

interface GroupPageProps {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
    connections: ConnectionData;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    reviews: PaginatedData<ReviewData[]>;
    locations: PaginatedData<LocationData[]>;
}

export default function Group({ group }: GroupPageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Group`} />
        </GroupLayout>
    );
}
