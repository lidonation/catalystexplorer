import {Head, WhenVisible} from '@inertiajs/react';
import GroupLayout from "../GroupLayout";
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import GroupData = App.DataTransferObjects.GroupData;
import {PaginatedData} from '../../../../types/paginated-data';
import IdeascaleProfileCardMini from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileCardMini';

interface IdeascaleProfilePageProps {
    ideascaleProfiles: PaginatedData<IdeascaleProfileData[]>;
    group: GroupData;
}

export default function IdeascaleProfiles({ideascaleProfiles, group}: IdeascaleProfilePageProps) {
    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Connections`}/>

            <WhenVisible data='ideascaleProfiles' fallback={<div>Loading Ideascale Profiles</div>}>
                <div className='w-full overflow-auto'>
                    {typeof ideascaleProfiles?.data !== 'undefined' && (
                        <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 '>
                            {ideascaleProfiles.data.map((profile) => (
                                <div className='rounded-lg border-2 border-border-dark-on-dark'>
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
