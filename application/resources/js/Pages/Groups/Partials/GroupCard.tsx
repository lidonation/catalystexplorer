import KeyValue from '@/Components/atoms/KeyValue';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import ValueLabel from '@/Components/atoms/ValueLabel';
import Card from '@/Components/Card';
import Divider from '@/Components/Divider';
import FundingPercentages from '@/Components/FundingPercentages';
import Image from '@/Components/Image';
import UserQuickView from '@/Components/UserQuickView';
import { ListProvider } from '@/Context/ListContext';
import IdeascaleProfileUsers from '@/Pages/IdeascaleProfile/Partials/IdeascaleProfileUsersComponent';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupSocials from './GroupSocials';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupCardProps {
    group: GroupData;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
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
        <Card className="h-full">
            <div className="border-gray-persist/50 text-gray-persist/50  z-20 ml-auto w-fit items-center rounded-md border-1 py-0">
                <ListProvider>
                    <BookmarkButton
                        modelType="groups"
                        width={16}
                        height={16}
                        itemId={group?.hash??'0'}
                    />
                </ListProvider>
            </div>
            <section className=" flex-grow space-y-4">
                <div className="flex w-full flex-col items-center gap-4 pt-2">
                    <Image
                        size="30"
                        imageUrl={group?.hero_img_url}
                        className="border-darker h-36 w-36 rounded-full border-3"
                    />
                </div>
                <div className="flex w-full flex-col items-center gap-4">
                    <Link
                        href={useLocalizedRoute('groups.group.proposals', {
                            group: group?.slug,
                        })}
                        className="flex w-full justify-center"
                    >
                        <Title level="5">{group?.name}</Title>
                    </Link>
                </div>
            </section>

            <section className="mt-auto pt-4">
                <div className="flex-grow">
                    <div className="px-2">
                        {userSelected ? (
                            <UserQuickView user={userSelected} />
                        ) : (
                            <>
                                <div className="mt-4 flex w-full items-center justify-between">
                                    <div>
                                        <div className="text-primary bg-eye-logo flex w-[60px] items-center justify-center rounded-md border p-1">
                                            <ValueLabel className="font-bold">
                                                {group?.proposals_funded ?? 0}
                                            </ValueLabel>
                                            <span>/</span>
                                            <ValueLabel className="text-xs">
                                                {group?.proposals_count ?? 0}
                                            </ValueLabel>
                                        </div>
                                        <Paragraph className="text-gray-persist mt-2 text-sm">
                                            {t('groups.fundedProposals')}
                                        </Paragraph>
                                    </div>

                                    <KeyValue
                                        valueKey={t('groups.reviews')}
                                        value={group?.reviews_count ?? 0}
                                        className="text-right"
                                    />
                                </div>

                                <section className="mt-3">
                                    <div
                                        className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}
                                    >
                                        {(group?.amount_awarded_ada ||
                                            noAwardedFunds) && (
                                            <div>
                                                <FundingPercentages
                                                    amount={
                                                        group?.amount_distributed_ada ??
                                                        0
                                                    }
                                                    total={
                                                        group?.amount_awarded_ada ??
                                                        0
                                                    }
                                                    primaryBackgroundColor="bg-content-light"
                                                    secondaryBackgroundColor="bg-primary"
                                                    amount_currency="ADA"
                                                />
                                            </div>
                                        )}
                                        {(group?.amount_awarded_usd ||
                                            noAwardedFunds) && (
                                            <FundingPercentages
                                                amount={
                                                    group?.amount_distributed_usd ??
                                                    0
                                                }
                                                total={
                                                    group?.amount_awarded_usd ??
                                                    0
                                                }
                                                primaryBackgroundColor="bg-content-light"
                                                secondaryBackgroundColor="bg-primary-dark"
                                                amount_currency="USD"
                                                isMini={true}
                                                twoColumns={
                                                    noAwardedFunds ||
                                                    allAwardedFunds
                                                }
                                            />
                                        )}
                                    </div>
                                </section>

                                {/* {group?.bio && (
                                    <div className="relative mt-4">
                                        <Paragraph className="text-gray-700">
                                            {group.bio}
                                        </Paragraph>
                                    </div>
                                )} */}
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <Divider />
                </div>

                <div className="border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Title level="4" className="font-medium">
                                {t('teams')}
                            </Title>
                            {group?.ideascale_profiles &&
                                group?.ideascale_profiles.length > 0 && (
                                    <IdeascaleProfileUsers
                                        users={group?.ideascale_profiles}
                                        onUserClick={handleUserClick}
                                        className="bg-content-light"
                                        toolTipProps={t('groups.viewMembers')}
                                    />
                                )}
                        </div>

                        <GroupSocials group={group} />
                    </div>
                </div>
            </section>
        </Card>
    );
};

export default GroupCard;
