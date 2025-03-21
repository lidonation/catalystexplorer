import React from 'react';
import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import GroupCardLoader from '@/Pages/Groups/Partials/GroupCardMiniLoader';
import GroupList from '@/Pages/Groups/Partials/GroupList';
import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';

interface GroupsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    groups: Array<any>;
}

export default function Groups({ideascaleProfile, groups}: GroupsPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
              <Head title={`${ideascaleProfile.name} - Groups`} />
            
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center">
                    {groups? (
                        <WhenVisible fallback={<GroupCardLoader />} data="groups">
                            <GroupList groups={groups} className='grid-cols-2'>
                                {(group) => (
                                    <GroupCardExtended
                                        key={group.hash}
                                        group={group}
                                    />
                                )}
                            </GroupList>
                        </WhenVisible>
                    ) : (
                        <RecordsNotFound />
                    )}
                </div>
            </div>
        </IdeascaleProfileLayout>
    );
}