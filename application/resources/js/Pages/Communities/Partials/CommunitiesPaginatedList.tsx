import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import React from 'react';
import CommunitiesList from './CommunitiesList';
import CommunityLoader from './CommunityLoader';
import CommunityData = App.DataTransferObjects.CommunityData;

interface CommunitiesProps {
    communities: PaginatedData<CommunityData[]>;
}

const CommunitiesPaginatedList: React.FC<CommunitiesProps> = ({
    communities,
}) => {
    return (
        <>
            {' '}
            <section className="container mt-4  w-full flex-col items-center justify-center overflow-hidden duration-500 ease-in-out">
                <WhenVisible fallback={<CommunityLoader />} data="campaigns">
                    <CommunitiesList communities={communities} />
                </WhenVisible>
            </section>
            {communities && communities.total > 0 && (
                <section className="container mt-4 w-full py-8">
                    {communities && <Paginator pagination={communities} />}
                </section>
            )}
        </>
    );
};

export default CommunitiesPaginatedList;
