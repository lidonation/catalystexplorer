import React from 'react';
import { Head } from '@inertiajs/react';
import GroupData = App.DataTransferObjects.GroupData;
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from "../../../types/paginated-data";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import LocationData = App.DataTransferObjects.LocationData;
import ConnectionData = App.DataTransferObjects.ConnectionData;
import MyLayout from './MyLayout';

interface GroupPageProps {
    group: GroupData;
    proposals: PaginatedData<ProposalData[]>;
    connections: ConnectionData;
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    reviews: PaginatedData<ReviewData[]>;
    locations: PaginatedData<LocationData[]>;
}

export default function Group({ 
    group,
}: GroupPageProps) {
    return (
        <MyLayout group={group}>
            <Head title={`${group.name} - Group`} />
        </MyLayout>
    );
}
