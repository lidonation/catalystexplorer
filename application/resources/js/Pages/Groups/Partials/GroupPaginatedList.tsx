import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import React from 'react';
import GroupCardLoader from './GroupCardMiniLoader';
import GroupList from './GroupList';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupListProps {
    groups: PaginatedData<GroupData[]>;
}

const GroupPaginatedList: React.FC<GroupListProps> = ({ groups }) => {
    return (
        <>
            <section className="container py-8">
                <WhenVisible fallback={<GroupCardLoader />} data="groups">
                    <GroupList groups={groups?.data || []} />
                </WhenVisible>
            </section>

            <section className="container">
                {groups && <Paginator pagination={groups} />}
            </section>
        </>
    );
};

export default GroupPaginatedList;
