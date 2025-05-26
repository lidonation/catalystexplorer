import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import CommunityData = App.DataTransferObjects.CommunityData;

import RecordsNotFound from '@/Layouts/RecordsNotFound';
import CommunityCard from '@/Pages/Communities/Partials/CommunityCard';
import CommunityLoader from '@/Pages/Communities/Partials/CommunityLoader';
import { PaginatedData } from '@/types/paginated-data';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';

interface CommunitiesPageProps {
    ideascaleProfile: IdeascaleProfileData;
    communities: PaginatedData<CommunityData[]>;
}

export default function Communities({
    ideascaleProfile,
    communities,
}: CommunitiesPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Communities`} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <section className="container mt-4 flex w-full flex-col items-center justify-center overflow-hidden duration-500 ease-in-out">
                    <WhenVisible
                        fallback={<CommunityLoader />}
                        data="communities"
                    >
                        <>
                            <div className="grid w-full grid-cols-1 grid-cols-2 gap-4">
                                {communities?.data &&
                                    communities?.data?.map((community) => (
                                        <CommunityCard
                                            key={community.hash}
                                            community={community}
                                        />
                                    ))}
                            </div>

                            {!communities?.data.length && (
                                <div className="flex flex-col items-center justify-center">
                                    <RecordsNotFound />
                                </div>
                            )}
                        </>
                    </WhenVisible>
                </section>
            </div>
        </IdeascaleProfileLayout>
    );
}
