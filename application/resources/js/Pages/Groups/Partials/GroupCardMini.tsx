import Card from '@/Components/Card';
import UserAvatar from '@/Components/UserAvatar';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupFundingPercentagesMini from './GroupFundingPercentageMini';
import GroupUsers from './GroupUsers';
import GroupData = App.DataTransferObjects.GroupData;
import {Link} from "@inertiajs/react";
import {useLocalizedRoute} from "@/utils/localizedRoute";
import Title from "@/Components/atoms/Title";

interface GroupCardMiniProps {
    group: GroupData;
}

const GroupCardMini: React.FC<GroupCardMiniProps> = ({ group }) => {
    const { t } = useTranslation();

    return group && (
        <Card>
            <div className="flex w-full flex-col items-center gap-4">
                <div className="bg-background-light flex-shrink-0 rounded-full">
                    <UserAvatar imageUrl={group?.profile_photo_url} size="30" />
                </div>

                <Link href={useLocalizedRoute('groups.group', {group: group?.slug})}
                      className="w-full flex justify-center">
                    <Title level="5">
                        {group?.name}
                    </Title>

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
                <GroupFundingPercentagesMini group={group} />
            </div>

            <div>
                <GroupUsers
                    users={group?.ideascale_profiles ?? []}
                    group={group}
                />
            </div>
        </Card>
    );
};

export default GroupCardMini;
