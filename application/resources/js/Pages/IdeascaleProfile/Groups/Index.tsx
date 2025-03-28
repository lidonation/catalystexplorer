import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import GroupData = App.DataTransferObjects.GroupData;
import { PaginatedData } from '../../../../types/paginated-data';
import { group } from 'console';
import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';

interface GroupsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    groups: PaginatedData<GroupData[]>;
}

export default function Groups({ideascaleProfile, groups}: GroupsPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
              <Head title={`${ideascaleProfile.name} - Groups`} />

            <div className="mx-auto">
                {
                    groups?.data ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {groups?.data?.map((group) => (
                                <div className="border-border-dark-on-dark rounded-lg border-2">
                                    <GroupCardExtended
                                        key={group?.hash}
                                        group={group}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                    <RecordsNotFound />
                </div>
                    )
                }

            </div>
        </IdeascaleProfileLayout>
    );
}
