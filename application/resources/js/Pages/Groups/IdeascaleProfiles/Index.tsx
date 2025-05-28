import IdeascaleProfileCardMini from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCardMini';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import GroupLayout from '../GroupLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import GroupData = App.DataTransferObjects.GroupData;

interface IdeascaleProfilePageProps {
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    group: GroupData;
}

export default function IdeascaleProfiles({
    ideascaleProfiles,
    group,
}: IdeascaleProfilePageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Connections`} />

            <WhenVisible
                data="ideascaleProfiles"
                fallback={<div>Loading Ideascale Profiles</div>}
            >
                <div className="w-full overflow-auto">
                    {typeof ideascaleProfiles?.data !== 'undefined' && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {ideascaleProfiles.data.map((profile) => (
                                <div className="border-border-dark-on-dark rounded-lg border-2">
                                    <IdeascaleProfileCardMini
                                        key={profile.hash}
                                        ideascaleProfile={profile}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </WhenVisible>
        </GroupLayout>
    );
}
