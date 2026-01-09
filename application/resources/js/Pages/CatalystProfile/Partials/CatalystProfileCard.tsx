import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import FundingPercentages from '@/Components/FundingPercentages';
import SegmentedBar from '@/Components/SegmentedBar';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import UserAvatar from '@/Components/UserAvatar';
import { ListProvider } from '@/Context/ListContext';
import BookmarkButton from '@/Pages/My/Bookmarks/Partials/BookmarkButton';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import ClaimedButton from './ClaimedButton';
import ShareButton from './ShareButton';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;
import GroupData = App.DataTransferObjects.GroupData;

interface CatalystProfileProps {
    catalystProfile: CatalystProfileData;
}

const CatalystProfileCard: React.FC<CatalystProfileProps> = ({
    catalystProfile,
}) => {
    const { t } = useLaravelReactI18n();
    const completedProposalsCount =
        catalystProfile?.completed_proposals_count ?? 0;
    const fundedProposalsCount = catalystProfile?.funded_proposals_count ?? 0;
    const submittedProposalsCount = catalystProfile?.proposals_count ?? 0;

    const segmentsLegend = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: completedProposalsCount,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: fundedProposalsCount,
        },
        {
            label: 'Submitted',
            color: 'bg-primary',
            value: submittedProposalsCount,
        },
    ] as Segments[];

    const chartSegments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: (completedProposalsCount / submittedProposalsCount) * 100,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value:
                ((fundedProposalsCount - completedProposalsCount) /
                    submittedProposalsCount) *
                100,
        },

        {
            label: 'Submitted',
            color: 'bg-primary',
            value:
                ((submittedProposalsCount - fundedProposalsCount) /
                    submittedProposalsCount) *
                100,
        },
    ] as Segments[];

    const extraSegments = [
        {
            label: 'Proposer',
            color: '',
            value: catalystProfile.own_proposals_count ?? 0,
        },
        {
            label: 'Collaborator',
            color: '',
            value: catalystProfile.collaborating_proposals_count ?? 0,
        },
    ] as Segments[];

    return (
        <Card className="bg-background">
            <div className="relative mb-2 h-full w-full">
                <div className="mb-3 flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <UserAvatar
                            name={
                                catalystProfile?.name ??
                                catalystProfile?.username
                            }
                            imageUrl={catalystProfile?.hero_img_url}
                            size="size-20"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-2 break-words">
                            <div className="flex w-full items-center">
                                <Title level="5" className="mr-1 font-bold">
                                    <Link
                                        className="line-clamp-2"
                                        href={useLocalizedRoute(
                                            'catalystProfiles.show',
                                            {
                                                id: catalystProfile?.id,
                                            },
                                        )}
                                    >
                                        {catalystProfile?.name ??
                                            catalystProfile?.username}
                                    </Link>
                                </Title>
                                {catalystProfile?.claimed_by && (
                                    <VerificationBadge />
                                )}
                            </div>

                            <Paragraph className="text-highlight" size="sm">
                                {catalystProfile?.groups
                                    ?.map((group: GroupData) => group?.name)
                                    .join(', ')}
                            </Paragraph>

                            <div className="mt-2 flex flex-row flex-wrap items-center gap-2 md:items-center">
                                <ClaimedButton
                                    modelType="catalyst.profiles"
                                    className="text-content-light"
                                    itemId={catalystProfile?.id ?? '0'}
                                />

                                <div className="w-fit items-center rounded-md p-0">
                                    <ShareButton
                                        catalystProfile={catalystProfile}
                                        modelType="catalyst.profiles"
                                    />
                                </div>
                                <div className="border-gray-persist/50 text-gray-persist/50 w-fit items-center rounded-md border-1 py-0">
                                    <ListProvider>
                                        <BookmarkButton
                                            modelType="catalyst.profiles"
                                            width={16}
                                            height={16}
                                            itemId={catalystProfile?.id ?? '0'}
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
                        {t('catalystProfiles.bio')}
                    </Paragraph>
                </div>
                <div className="border-gray-persist border-t">
                    <Paragraph size="sm" className="mt-4">
                        {catalystProfile?.bio ?? 'this profile has no bio'}
                    </Paragraph>
                </div>
            </div>

            <div className="mt-4 mb-4 flex justify-between gap-2">
                <div>
                    <Paragraph
                        size="lg"
                        className="font-bold"
                    >{`${currency(catalystProfile?.amount_requested_ada ?? 0, 2, 'ADA')} + ${currency(catalystProfile?.amount_requested_usd ?? 0, 2, 'USD')}`}</Paragraph>
                    <Paragraph size="md" className="mt-1">
                        {t('catalystProfiles.totalRequested')}
                    </Paragraph>
                </div>
                <div>
                    <Paragraph size="lg" className="font-bold">
                        {catalystProfile?.proposals_count ?? 0}
                    </Paragraph>
                    <Paragraph size="md" className="mt-1">
                        {t('catalystProfiles.totalProposals')}
                    </Paragraph>
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-4">
                <div>
                    <div className="flex w-full justify-between pt-4">
                        <SegmentedBar
                            segments={chartSegments}
                            tooltipSegments={segmentsLegend}
                        >
                            {extraSegments.map((segment, index) => (
                                <div key={index} className="flex items-center">
                                    <Paragraph className="text-3">
                                        {segment.label}:
                                    </Paragraph>
                                    <Paragraph className="text-3 ml-1 font-bold">
                                        {segment.value}
                                    </Paragraph>
                                </div>
                            ))}
                        </SegmentedBar>
                    </div>
                    <ul className="mt-2 flex w-full flex-wrap gap-x-4">
                        {segmentsLegend.map((segment, index) => (
                            <li key={index} className="mt-2">
                                <div
                                    className={`mt-1 h-2 w-2 rounded-full ${segment.color}`}
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
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <FundingPercentages
                                amount={
                                    catalystProfile?.amount_awarded_ada ?? 0
                                }
                                total={
                                    catalystProfile?.amount_requested_ada ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                            <FundingPercentages
                                amount={
                                    catalystProfile?.amount_awarded_usd ?? 0
                                }
                                total={
                                    catalystProfile?.amount_requested_usd ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        </div>
                        <Paragraph className="text-highlight">
                            {t('catalystProfiles.awardedVsRequested')}
                        </Paragraph>
                    </div>

                    <div>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <FundingPercentages
                                amount={
                                    catalystProfile?.amount_distributed_ada ??
                                    0
                                }
                                total={
                                    catalystProfile?.amount_awarded_ada ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                            <FundingPercentages
                                amount={
                                    catalystProfile?.amount_distributed_usd ??
                                    0
                                }
                                total={
                                    catalystProfile?.amount_awarded_usd ?? 0
                                }
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        </div>
                        <Paragraph className="text-highlight">
                            {t('catalystProfiles.receivedVsAwarded')}
                        </Paragraph>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default CatalystProfileCard;
