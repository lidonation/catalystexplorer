import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import React from 'react';
import IdeaScaleProfileLoader from './IdeaScaleProfileLoader';
import IdeascaleProfilesList from './IdeascaleProfileList';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfilesListProps {
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
}

const IdeascaleProfilePaginatedList: React.FC<IdeascaleProfilesListProps> = ({
    ideascaleProfiles,
}) => {
    const maxProfilesPerPage = ideascaleProfiles?.per_page ?? 10;

    return (
        <>
            {' '}
            <div className="flex w-full flex-col items-center">
                <section className="container py-2 pb-10">
                    <WhenVisible
                        fallback={
                            <IdeaScaleProfileLoader
                                count={maxProfilesPerPage}
                            />
                        }
                        data="ideascaleProfiles"
                    >
                        <IdeascaleProfilesList
                            ideascaleProfiles={ideascaleProfiles?.data || []}
                        />
                    </WhenVisible>
                </section>
            </div>
            {ideascaleProfiles && ideascaleProfiles.total > 0 && (
                <section className="container w-full">
                    <Paginator pagination={ideascaleProfiles} />
                </section>
            )}
        </>
    );
};

export default IdeascaleProfilePaginatedList;
