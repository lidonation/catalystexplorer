import Paginator from '@/Components/Paginator';
import { PaginatedData } from '@/types/paginated-data';
import { WhenVisible } from '@inertiajs/react';
import React from 'react';
import CatalystProfileLoader from './CatalystProfileLoader.tsx';
import CatalystProfilesList from './CatalystProfileList';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;

interface CatalystProfilesListProps {
    catalystProfiles: PaginatedData<CatalystProfileData[]>;
}

const CatalystProfilePaginatedList: React.FC<CatalystProfilesListProps> = ({
    catalystProfiles,
}) => {
    const maxProfilesPerPage = catalystProfiles?.per_page ?? 10;

    return (
        <>
            {' '}
            <div className="flex w-full flex-col items-center">
                <section className="container py-2 pb-10">
                    <WhenVisible
                        fallback={
                            <CatalystProfileLoader
                                count={maxProfilesPerPage}
                            />
                        }
                        data="catalystProfiles"
                    >
                        <CatalystProfilesList
                            catalystProfiles={catalystProfiles?.data || []}
                        />
                    </WhenVisible>
                </section>
            </div>
            {catalystProfiles && catalystProfiles.total > 0 && (
                <section className="container w-full">
                    <Paginator pagination={catalystProfiles} />
                </section>
            )}
        </>
    );
};

export default CatalystProfilePaginatedList;
