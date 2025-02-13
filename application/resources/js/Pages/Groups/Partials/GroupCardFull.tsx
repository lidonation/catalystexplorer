import SegmentedBar from '@/Components/SegmentedBar';
import SegmentedBar from '@/Components/SegmentedBar';
import { currency } from '@/utils/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import { Segments } from '../../../../types/segments';
import GroupFundingPercentages from './GroupFundingPercentages';
import GroupHeroSection from './GroupHeroSection';
import GroupData = App.DataTransferObjects.GroupData;

interface GroupCardFullProps {
    group: GroupData;
}

const GroupCardFull: React.FC<GroupCardFullProps> = ({ group }) => {
    const { t } = useTranslation();

    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: group?.proposals_completed,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: group?.proposals_funded,
        },
        {
            label: 'Unfunded',
            color: 'bg-primary',
            value: group?.proposals_unfunded,
        },
    ] as Segments[];

    const noAwardedFunds =
        !group?.amount_awarded_ada && !group?.amount_awarded_usd;
    const allAwardedFunds =
        group?.amount_awarded_ada && group?.amount_awarded_usd;

    const noReceivedFunds =
        !group?.amount_distributed_ada && !group?.amount_distributed_usd;
    const allReceivedFunds =
        group?.amount_distributed_ada && group?.amount_distributed_usd;

    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: group?.proposals_completed,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: group?.proposals_funded,
        },
        {
            label: 'Unfunded',
            color: 'bg-primary',
            value: group?.proposals_unfunded,
        },
    ] as Segments[];

    const noAwardedFunds =
        !group?.amount_awarded_ada && !group?.amount_awarded_usd;
    const allAwardedFunds =
        group?.amount_awarded_ada && group?.amount_awarded_usd;

    const noReceivedFunds =
        !group?.amount_distributed_ada && !group?.amount_distributed_usd;
    const allReceivedFunds =
        group?.amount_distributed_ada && group?.amount_distributed_usd;

    return (
        <div className="bg-background flex h-full w-full flex-col rounded-lg shadow-md">
        <div className="bg-background flex h-full w-full flex-col rounded-lg shadow-md">
            <GroupHeroSection group={group} />
            <div className="mt-4 p-3">
                <div className="flex w-full flex-col items-center gap-4">
                    <p className="text-lg font-bold">{group?.name}</p>
                </div>
                <div className="mt-4 flex justify-between">
                <div className="mt-4 flex justify-between">
                    <div>
                        <div className="flex gap-2">
                            <p className="text-1 font-bold">
                                {currency(
                                    group?.amount_requested_ada ?? 0,
                                    'ADA',
                                )}{' '}
                            </p>
                            +{' '}
                            <p className="text-1 font-bold">
                                {' '}
                                {currency(
                                    group?.amount_requested_usd ?? 0,
                                    'USD',
                                )}
                            </p>
                        </div>
                        <p className="text-3 text-gray-persist">
                            {t('groups.totalRequested')}
                        </p>
                    </div>
                    <div>
                        <p className="text-1 font-bold">
                            {group?.proposals_count ?? 0}
                        </p>
                        <p className="text-3 text-gray-persist">
                            {t('groups.totalProposals')}
                        </p>
                        <p className="text-1 font-bold">
                            {group?.proposals_count ?? 0}
                        </p>
                        <p className="text-3 text-gray-persist">
                            {t('groups.totalProposals')}
                        </p>
                    </div>
                </div>

                <div className="border-content-light mt-4 border-t border-b pt-4 pb-4">
                    <SegmentedBar segments={segments} />
                    <ul className='w-full flex justify-between mt-2'>
                        {segments.map((segment, index) => (
                            <li key={index} className='flex justify-between mt-2'>
                                <div
                                    className={`h-2 w-2 rounded-full mt-2 mr-2 ${segment.color}`}
                                />

                                <div className='flex justify-between gap-x-1'>
                                    <p className="text-gray-persist">
                                        {segment.label}:
                                    </p>
                                    <p className="font-bold">{`${segment.value}`}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <div
                        className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-2`}
                    >
                        {(group?.amount_awarded_ada || noAwardedFunds) && (
                            <GroupFundingPercentages
                                amount={group?.amount_awarded_ada ?? 0}
                                total={group?.amount_requested_ada ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                        )}
                        {(group?.amount_awarded_usd || noAwardedFunds) && (
                            <GroupFundingPercentages
                                amount={group?.amount_awarded_usd ?? 0}
                                total={group?.amount_requested_usd ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary-dark"
                                amount_currency="USD"
                            />
                        )}
                        <p className="text-3 text-gray-persist">
                            {t('groups.awardedVsRequested')}
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
                        <p className="text-3 text-gray-persist">
                            {t('groups.receivedVsAwarded')}
                        </p>
                    </div>
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
                        <p className="text-3 text-gray-persist">
                            {t('groups.receivedVsAwarded')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupCardFull;
