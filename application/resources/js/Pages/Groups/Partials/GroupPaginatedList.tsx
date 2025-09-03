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
    cardType?: 'full' | 'mini';
    gridCols?: string;
}

const GroupPaginatedList: React.FC<GroupListProps> = ({
    groups,
    cardType = 'mini',
    gridCols,
}) => {
    return (
        <>
            <section className="container py-8">
                <WhenVisible fallback={<GroupCardLoader />} data="groups">
                    {groups?.data?.length ? (
                        <>
                            <GroupList
                                groups={groups?.data || []}
                                cardType={cardType}
                                gridCols={gridCols}
                            />
                            <section className="mt-4 lg:mt-8">
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
