import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileCardMini from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCardMini';
import IdeaScaleProfileLoader from '@/Pages/IdeascaleProfile/Partials/IdeaScaleProfileLoader';
import { Head, WhenVisible } from '@inertiajs/react';
import { PaginatedData } from '../../../../types/paginated-data';
import CommunityLayout from '../CommunityLayout';
import CommunityData = App.DataTransferObjects.CommunityData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import { useEffect } from 'react';

interface DashboardPageProps {
    community: CommunityData;
   ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
}

export default function Proposals({ community, ideascaleProfiles }: DashboardPageProps) {
    useEffect(()=>{
        console.log(ideascaleProfiles)
    })
    return (
        <CommunityLayout community={community}>
            <Head title={`${community?.title} - Members`} />
            <WhenVisible
                data="ideascaleProfiles"
                fallback={<IdeaScaleProfileLoader />}
            >
                {ideascaleProfiles?.data ? (
                    <>
                        <div className="w-full overflow-auto">
                            {typeof ideascaleProfiles?.data !== 'undefined' && (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {ideascaleProfiles.data.map((ideascaleProfile) => (
                                        <div className="border-border-dark-on-dark rounded-lg border-2">
                                            <IdeascaleProfileCardMini
                                                key={ideascaleProfile?.hash}
                                                ideascaleProfile={ideascaleProfile}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <RecordsNotFound />
                )}
            </WhenVisible>
        </CommunityLayout>
    );
}
