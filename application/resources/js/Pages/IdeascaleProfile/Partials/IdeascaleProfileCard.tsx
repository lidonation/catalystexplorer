import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import SegmentedBar from '@/Components/SegmentedBar';
import ConnectIcon from '@/Components/svgs/ConnectIcon';
import UserAvatar from '@/Components/UserAvatar';
import { ListProvider } from '@/Context/ListContext';
import GroupFundingPercentages from '@/Pages/Groups/Partials/GroupFundingPercentages';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

interface IdeascaleProfileProps {
    ideascaleProfile: IdeascaleProfileData;
}

const IdeascaleProfileCard: React.FC<IdeascaleProfileProps> = ({
    ideascaleProfile,
}) => {
    const { t } = useTranslation();
    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: ideascaleProfile.completed_proposals_count ?? 0,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: ideascaleProfile.funded_proposals_count ?? 0,
        },
        {
            label: 'Submitted',
            color: 'bg-primary',
            value: ideascaleProfile.proposals_count ?? 0,
        },
    ] as Segments[];

    const extraSegments = [
        {
            label: 'Proposer',
            color: '',
            value: ideascaleProfile.own_proposals_count ?? 0,
        },
        {
            label: 'Collaborator',
            color: '',
            value: ideascaleProfile.collaborating_proposals_count ?? 0,
        },
    ] as Segments[];

    return (
        <Card>
            <div className="relative mb-2 h-full w-full">
                <div className="mb-3 flex items-center gap-x-2">
                    <div className="flex-shrink-0">
                        <UserAvatar
                            imageUrl={ideascaleProfile?.hero_img_url}
                            size="size-12"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-2 font-bold break-words">
                            <Title level="4">
                                <Link
                                    className="line-clamp-2"
                                    href={useLocalizedRoute(
                                        'ideascaleProfiles.show',
                                        { id: ideascaleProfile?.hash },
                                    )}
                                >
                                    {ideascaleProfile?.name ??
                                        ideascaleProfile?.username}
                                </Link>
                            </Title>
                            <div className="mt-2 flex gap-2">
                                <div className="bg-success text-background w-fit rounded-md p-2">
                                    <Paragraph size="sm">Claimed</Paragraph>
                                </div>
                                <div className="border-gray-persist text-gray-persist w-fit items-center rounded-md border p-2">
                                    <ConnectIcon />
                                </div>
                                <div className="border-gray-persist text-gray-persist w-fit items-center rounded-md border">
                                    <ListProvider>
                                        <BookmarkButton
                                            modelType="ideascale-profiles"
                                            itemId={
                                                ideascaleProfile?.hash ?? '0'
                                            }
                                        />
                                    </ListProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 mb-2">
                <div className="mb-4">
                    <Paragraph size="md" className="font-bold">
                        Bio
                    </Paragraph>
                </div>
                <div className="border-gray-persist border-t">
                    <Paragraph size="sm" className="mt-4">
                        {ideascaleProfile?.bio ?? 'this profile has no bio'}
                    </Paragraph>
                </div>
            </div>

            <div className="mt-4 mb-4 flex justify-between">
                <div>
                    <Paragraph
                        size="lg"
                        className="font-bold"
                    >{`${currency(ideascaleProfile?.amount_requested_ada ?? 0, 2, 'ADA')} + ${currency(ideascaleProfile?.amount_requested_usd ?? 0, 2, 'USD')}`}</Paragraph>
                    <Paragraph size="md">Total Requested</Paragraph>
                </div>
                <div>
                    <Paragraph size="lg" className="font-bold">
                        {ideascaleProfile?.proposals_count ?? 0}
                    </Paragraph>
                    <Paragraph size="md">Total Proposals</Paragraph>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
                <div>
                    <div className="flex w-full justify-between pt-4">
                        <SegmentedBar segments={segments}>
                            {extraSegments.map((segment, index) => (
                                <div key={index} className="flex items-center">
                                    <p className="text-3">{segment.label}:</p>
                                    <p className="text-3 ml-1 font-bold">
                                        {segment.value}
                                    </p>
                                </div>
                            ))}
                        </SegmentedBar>
                    </div>
                    <ul className="mt-2 flex w-full justify-between">
                        {segments.map((segment, index) => (
                            <li key={index} className="mt-2">
                                <div
                                    className={`mt-1 mr-1 h-2 w-2 rounded-full ${segment.color}`}
                                />
                                <div className="mt-2 flex justify-between">
                                    <Paragraph
                                        size="sm"
                                        className="text-gray-persist mr-1"
                                    >
                                        {segment.label}:
                                    </Paragraph>
                                    <Paragraph className="font-bold" size="sm">
                                        {segment.value}
                                    </Paragraph>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col gap-2">
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <GroupFundingPercentages
                                amount={
                                    ideascaleProfile?.amount_awarded_ada ?? 0
                                }
                                total={
                                    ideascaleProfile?.amount_requested_ada ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                                isMini={false}
                                twoColumns={true}
                            />
                            <GroupFundingPercentages
                                amount={
                                    ideascaleProfile?.amount_awarded_usd ?? 0
                                }
                                total={
                                    ideascaleProfile?.amount_requested_usd ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                                isMini={false}
                                twoColumns={true}
                            />
                        </div>
                        <Paragraph>Awarded vs Requested</Paragraph>
                    </div>

                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <GroupFundingPercentages
                                amount={
                                    ideascaleProfile?.amount_distributed_ada ??
                                    0
                                }
                                total={
                                    ideascaleProfile?.amount_awarded_ada ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                                isMini={false}
                                twoColumns={true}
                            />
                            <GroupFundingPercentages
                                amount={
                                    ideascaleProfile?.amount_distributed_usd ?? 0
                                }
                                total={
                                    ideascaleProfile?.amount_awarded_usd ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                                isMini={false}
                                twoColumns={true}
                            />
                        </div>
                        <Paragraph>Awarded vs Requested</Paragraph>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default IdeascaleProfileCard;
