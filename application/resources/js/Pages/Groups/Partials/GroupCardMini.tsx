import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import FundingPercentages from '@/Components/FundingPercentages';
import Image from '@/Components/Image';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

    const noAwardedFunds =
        !group?.amount_awarded_ada && !group?.amount_awarded_usd;
    const allAwardedFunds = !!(
        group?.amount_awarded_ada && group?.amount_awarded_usd
    );

    return (
        group && (
            <Card>
                <div className="flex h-full w-full flex-col items-center gap-4">
                    <Image size="30" imageUrl={group?.hero_img_url} />
                    <Link
                        href={useLocalizedRoute('groups.group', {
                            group: group?.slug,
                        })}
                        className="flex w-full justify-center"
                    >
                        <Title level="5">{group?.name}</Title>
                    </Link>
                </div>
                <div className="flex w-full items-center justify-between">
                    <div>
                        <div className="text-primary bg-eye-logo mt-2 flex w-[60px] items-center justify-center rounded-md border p-1">
                            <div className="text-3 font-bold">
                                {group?.proposals_funded ?? 0}
                            </div>
                            <div>/</div>
                            <div className="text-xs">
                                {group?.proposals_count ?? 0}
                            </div>
                        </div>
                        <p className="text-gray-persist mt-2">
                            {t('groups.fundedProposals')}
                        </p>
                    </div>

                    <div>
                        <p className="text-1 font-bold">
                            {group?.reviews_count ?? 0}
                        </p>
                        <p className="text-3 text-gray-persist mt-2">
                            {t('groups.reviews')}
                        </p>
                    </div>
                </div>

                <div>
                    <div
                        className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
                    >
                        {(group?.amount_awarded_ada || noAwardedFunds) && (
                            <div>
                                <FundingPercentages
                                    amount={group?.amount_distributed_ada ?? 0}
                                    total={group?.amount_awarded_ada ?? 0}
                                    primaryBackgroundColor="bg-content-light"
                                    secondaryBackgroundColor="bg-primary"
                                    amount_currency="ADA"
                                />
                            </div>
                        )}
                        {(group?.amount_awarded_usd || noAwardedFunds) && (
                            <FundingPercentages
                                amount={group?.amount_distributed_usd ?? 0}
                                total={group?.amount_awarded_usd ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        )}
                    </div>
                </div>

                <div className="border-content-light mt-2 flex items-center justify-between border-t pt-3">
                    {group?.ideascale_profiles &&
                        group?.ideascale_profiles.length > 0 && (
                            <IdeascaleProfileUsers
                                users={group?.ideascale_profiles || []}
                                onUserClick={handleUserClick}
                                className="bg-primary text-light-persist"
                                toolTipProps={t('groups.viewMembers')}
                            />
                        )}
                    <div className="ml-auto">
                        <GroupSocials group={group} />
                    </div>
                </div>
            </Card>
        )
    );
};

export default GroupCardMini;
