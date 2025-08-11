import RecordsNotFound from '@/Layouts/RecordsNotFound';
import GroupCardExtended from '@/Pages/Groups/Partials/GroupCardExtended';
import GroupCardLoader from '@/Pages/Groups/Partials/GroupCardMiniLoader';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import GroupData = App.DataTransferObjects.GroupData;

interface GroupsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    groups: PaginatedData<GroupData[]>;
}

export default function Groups({ ideascaleProfile, groups }: GroupsPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Groups`} />

            <WhenVisible data="groups" fallback={<GroupCardLoader />}>
                <div className="w-full overflow-auto">
                    {groups?.data && groups.data.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {groups?.data.map((group) => (
                                <div className="border-border-dark-on-dark rounded-lg border-2">
                                    <GroupCardExtended
                    key={group?.uuid}
                                        group={group}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <RecordsNotFound />
                        </div>
                    )}
                </div>
            </WhenVisible>
        </IdeascaleProfileLayout>
    );
}
