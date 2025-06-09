import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
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
                    {groups?.data?.length ? (
                        <>
                            <GroupList groups={groups?.data || []} />
                            <section className="lg:mt-8 mt-4">
                                <Paginator pagination={groups} />
                            </section>
                        </>
                    ) : (
                        <section className="">
                            <RecordsNotFound />
                        </section>
                    )}
                </WhenVisible>
            </section>
        </>
    );
};

export default GroupPaginatedList;
