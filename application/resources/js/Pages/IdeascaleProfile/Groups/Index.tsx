import { Head, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import GroupData = App.DataTransferObjects.GroupData;
import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';
import GroupCardLoader from '@/Pages/Groups/Partials/GroupCardMiniLoader';

interface GroupsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    groups: PaginatedData<GroupData[]>;
}

export default function Groups({ ideascaleProfile, groups }: GroupsPageProps) {
    const { t } = useTranslation();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Groups`} />

            <WhenVisible data="groups" fallback={<GroupCardLoader />}>
                <div className="w-full overflow-auto">
                    {typeof groups?.data !== 'undefined' && (
                        <div className="grid grid-cols-2 gap-4">
                            {groups?.data.map((group) => (
                                <div className="border-border-dark-on-dark rounded-lg border-2">
                                    <GroupCardExtended
                                        key={group?.hash}
                                        group={group}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </WhenVisible>
        </IdeascaleProfileLayout>
    );
}
