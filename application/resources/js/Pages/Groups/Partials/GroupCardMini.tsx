import UserAvatar from '@/Components/UserAvatar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupFundingPercentages from './GroupFundingPercentage';
import GroupUsers from './GroupUsers';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupCardMiniProps {
    group: GroupData;
}

const GroupCardMini: React.FC<GroupCardMiniProps> = ({ group }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-background flex w-full flex-col rounded-lg p-3 shadow-md sm:p-4">
            <div className="flex w-full flex-col items-center gap-4">
                <div className="bg-background-light flex-shrink-0 rounded-full">
                    <UserAvatar imageUrl={group?.profile_photo_url} size="30" />
                </div>

                <p className="text-lg font-bold">{group?.name}</p>
            </div>
            <div>
                <div className="mt-2 text-primary bg-eye-logo flex w-[60px] items-center justify-center rounded-md border p-1">
                    <p className="text-3 font-bold">
                        {group?.proposals_funded}
                    </p>
                    <p>/</p>
                    <p className="text-xs">{group?.proposals_count}</p>
                </div>
                <p className="mt-2">{t('groups.fundedProposals')}</p>
            </div>

            <div>
                <GroupFundingPercentages group={group} />
            </div>

            <div>
                <GroupUsers users={group?.ideascale_profiles} />
            </div>
        </div>
    );
};

export default GroupCardMini;
