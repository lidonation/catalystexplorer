import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import UserAvatar from '@/Components/UserAvatar';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupFundingPercentages from './GroupFundingPercentages';
import GroupSocials from './GroupSocials';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupCardMiniProps {
    group: GroupData;
}

const GroupCardMini: React.FC<GroupCardMiniProps> = ({ group }) => {
    const { t } = useTranslation();

    const [userSelected, setUserSelected] =
        useState<App.DataTransferObjects.IdeascaleProfileData | null>(null);

    const handleUserClick = useCallback(
        (user: App.DataTransferObjects.IdeascaleProfileData) =>
            setUserSelected(user),
        [],
    );

    return (
        group && (
            <Card>
                <div className="flex w-full flex-col items-center gap-4">
                    <div className="bg-background-light flex-shrink-0 rounded-full">
                        <UserAvatar
                            imageUrl={group?.profile_photo_url}
                            size="30"
                        />
                    </div>

                    <Link
                        href={useLocalizedRoute('groups.group', {
                            group: group?.slug,
                        })}
                        className="flex w-full justify-center"
                    >
                        <Title level="5">{group?.name}</Title>
                    </Link>
                </div>
                <div>
                    <div className="text-primary bg-eye-logo mt-2 flex w-[60px] items-center justify-center rounded-md border p-1">
                        <div className="text-3 font-bold">
                            {group?.proposals_funded}
                        </div>
                        <div>/</div>
                        <div className="text-xs">{group?.proposals_count}</div>
                    </div>
                    <p className="mt-2">{t('groups.fundedProposals')}</p>
                </div>

                <div>
                    <GroupFundingPercentages
                        amount_ada={group?.amount_distributed_ada ?? 0}
                        total_ada={group?.amount_awarded_ada ?? 0}
                        amount_usd={group?.amount_distributed_usd ?? 0}
                        total_usd={group?.amount_awarded_usd ?? 0}
                    />
                </div>

                <div className="border-content-light mt-2 flex items-center justify-between border-t pt-3">
                    <IdeascaleProfileUsers
                        users={group?.ideascale_profiles || []}
                        onUserClick={handleUserClick}
                    />
                    <GroupSocials group={group} />
                </div>
            </Card>
        )
    );
};

export default GroupCardMini;
