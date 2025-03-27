import Title from '@/Components/atoms/Title';
import FundingPercentages from '@/Components/FundingPercentages';
import SegmentedBar from '@/Components/SegmentedBar';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import GroupHeroSection from './GroupHeroSection';
import GroupData = App.DataTransferObjects.GroupData;
import Paragraph from '@/Components/atoms/Paragraph';

interface GroupCardFullProps {
    group: GroupData;
    children?: React.ReactNode;
}

const GroupCardExtended: React.FC<GroupCardFullProps> = ({ group, children }) => {
    const { t } = useTranslation();

    const completedGroupsCount = group?.completed_proposals_count ?? 0;
    const FundedGroupssCount = group?.funded_proposals_count ?? 0;
    const UnfundedGroupsCount = group?.unfunded_proposals_count ?? 0;

    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: completedGroupsCount,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: FundedGroupssCount,
        },
        {
            label: 'Unfunded',
            color: 'bg-primary',
            value: UnfundedGroupsCount,
        },
    ] as Segments[];

    const noAwardedFunds =
        !group?.amount_awarded_ada && !group?.amount_awarded_usd;
    const allAwardedFunds = !!(
        group?.amount_awarded_ada && group?.amount_awarded_usd
    );

    const noReceivedFunds =
        !group?.amount_distributed_ada && !group?.amount_distributed_usd;
    const allReceivedFunds = !!(
        group?.amount_distributed_ada && group?.amount_distributed_usd
    );

    return (
        <div className="bg-background flex h-full w-full flex-col rounded-lg shadow-md">
            <GroupHeroSection group={group} children={children}/>

            <div className="mt-4 p-3">
                <div className="flex w-full flex-col items-center gap-4">
                    <Link
                        href={useLocalizedRoute('groups.group.index', {
                            group: group?.slug,
                        })}
                        className="flex w-full justify-center"
                    >
                        <Title level="5">{group?.name}</Title>
                    </Link>
                </div>

                <div className="mt-4 flex justify-between">
                    <div>
                        <div className="flex gap-2">
                            <div className="text-1 font-bold">
                                {currency(
                                    group?.amount_requested_ada ?? 0,
                                    2,
                                    'ADA',
                                )}
                            </div>
                            +
                            <p className="text-1 font-bold">
                                {currency(
                                    group?.amount_requested_usd ?? 0,
                                    2,
                                    'USD',
                                )}
                            </p>
                        </div>
                        <Paragraph className="text-3 text-gray-persist text-left">
                            {t('groups.totalRequested')}
                        </Paragraph>
                    </div>
                    <div>
                        <p className="text-1 font-bold">
                            {group?.proposals_count ?? 0}
                        </p>
                        <p className="text-3 text-gray-persist">
                            {t('proposals.totalProposals')}
                        </p>
                    </div>
                </div>

                <div className="border-content-light mt-4 border-t border-b pt-4 pb-4">
                    <SegmentedBar segments={segments} tooltipSegments={segments} />
                    <ul className="mt-2 flex w-full justify-between">
                        {segments.map((segment, index) => (
                            <li
                                key={index}
                                className="mt-2 flex justify-between"
                            >
                                <div
                                    className={`mt-2 mr-2 h-2 w-2 rounded-full ${segment.color}`}
                                />
                                <div className="flex justify-between gap-x-1">
                                    <p className="text-gray-persist">
                                        {segment.label}:
                                    </p>
                                    <p className="font-bold">{segment.value}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div
                        className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
                    >
                        {(group?.amount_awarded_ada || noAwardedFunds) && (
                            <FundingPercentages
                                amount={group?.amount_awarded_ada ?? 0}
                                total={group?.amount_requested_ada ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                        )}
                        {(group?.amount_awarded_usd || noAwardedFunds) && (
                            <FundingPercentages
                                amount={group?.amount_awarded_usd ?? 0}
                                total={group?.amount_requested_usd ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        )}
                    </div>
                    <Paragraph className="text-3 text-gray-persist mt-1 text-left">
                        {t('groups.awardedVsRequested')}
                    </Paragraph>
                </div>

                <div>
                    <div
                        className={`grid ${noReceivedFunds || allReceivedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
                    >
                        {(group?.amount_distributed_ada || noAwardedFunds) && (
                            <FundingPercentages
                                amount={group?.amount_distributed_ada ?? 0}
                                total={group?.amount_awarded_ada ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                        )}
                        {(group?.amount_distributed_usd || noAwardedFunds) && (
                            <FundingPercentages
                                amount={group?.amount_distributed_usd ?? 0}
                                total={group?.amount_awarded_usd ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        )}
                    </div>

                    <Paragraph className="text-3 text-gray-persist mt-1 text-left">
                        {t('groups.receivedVsAwarded')}
                    </Paragraph>
                </div>
            </div>
        </div>
    );
};

export default GroupCardExtended;
