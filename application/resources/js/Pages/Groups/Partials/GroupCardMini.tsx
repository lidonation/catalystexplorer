import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import Image from '@/Components/Image';
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

    const noAwardedFunds =
        !group?.amount_awarded_ada && !group?.amount_awarded_usd;
    const allAwardedFunds =
        group?.amount_awarded_ada && group?.amount_awarded_usd;

    return (
        group && (
            <Card>
                <div className="flex h-full w-full flex-col items-center gap-4">
                    <Image size="30" imageUrl={group?.profile_photo_url} />
                    <Link
                        href={useLocalizedRoute('groups.group', {
                            group: group?.slug,
                        })}
                        className="flex w-full justify-center"
                    >
                        <Title level="5">{group?.name}</Title>
                    </Link>
                </div>
                <div className='w-full flex justify-between items-center'>
                    <div>
                        <div className="text-primary bg-eye-logo mt-2 flex w-[60px] items-center justify-center rounded-md border p-1">
                            <div className="text-3 font-bold">
                                {group?.proposals_funded}
                            </div>
                            <div>/</div>
                            <div className="text-xs">
                                {group?.proposals_count}
                            </div>
                        </div>
                        <p className="mt-2  text-gray-persist">{t('groups.fundedProposals')}</p>
                    </div>

                    <div>
                        <p className="text-1 font-bold">{group?.reviews}</p>
                        <p className="text-3  mt-2 text-gray-persist">
                            {t('groups.reviews')}
                        </p>
                    </div>
                </div>

                <div>
                    <div
                        className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-2`}
                    >
                        {(group?.amount_awarded_ada || noAwardedFunds) && (
                            <GroupFundingPercentages
                                amount={group?.amount_distributed_ada ?? 0}
                                total={group?.amount_awarded_ada ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                        )}
                        {(group?.amount_awarded_usd || noAwardedFunds) && (
                            <GroupFundingPercentages
                                amount={group?.amount_distributed_usd ?? 0}
                                total={group?.amount_awarded_usd ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        )}
                    </div>
                    <p>{t('groups.received')}</p>
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
