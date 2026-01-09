import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;
import CommunityData = App.DataTransferObjects.CommunityData;

import RecordsNotFound from '@/Layouts/RecordsNotFound';
import CommunityCard from '@/Pages/Communities/Partials/CommunityCard';
import CommunityLoader from '@/Pages/Communities/Partials/CommunityLoader';
import { PaginatedData } from '@/types/paginated-data';
import CatalystProfileLayout from '../CatalystProfileLayout';

interface CommunitiesPageProps {
    catalystProfile: CatalystProfileData;
    communities: PaginatedData<CommunityData[]>;
}

export default function Communities({
    catalystProfile,
    communities,
}: CommunitiesPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <CatalystProfileLayout catalystProfile={catalystProfile}>
            <Head title={`${catalystProfile.name} - Communities`} />

            <section className="container mt-4 flex w-full flex-col items-center justify-center overflow-hidden duration-500 ease-in-out">
                <WhenVisible fallback={<CommunityLoader />} data="communities">
                    <>
                        <div className="grid w-full grid-cols-1 grid-cols-2 gap-4">
                            {communities?.data &&
                                communities?.data?.map((community) => (
                                    <CommunityCard
                                        key={community.id}
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
        </CatalystProfileLayout>
    );
}
