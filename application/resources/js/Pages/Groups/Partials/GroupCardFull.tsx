import { currency } from '@/utils/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupFundingPercentages from './GroupFundingPercentages';
import GroupHeroSection from './GroupHeroSection';
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '../../../../types/segments';
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
                value: group?.completed_proposals_count,
            },
            {
                label: 'Funded',
                color: 'bg-warning',
                value: group?.funded_proposals_count,
            },
            {
                label: 'Unfunded',
                color: 'bg-primary',
                value: group?.unfunded_proposals_count,
            },
        ] as Segments[];

    return (
        <div className="bg-background flex w-full h-full flex-col rounded-lg shadow-md">
            <GroupHeroSection group={group} />
            <div className="mt-4 p-3">
                <div className="flex w-full flex-col items-center gap-4">
                    <p className="text-lg font-bold">{group?.name}</p>
                </div>
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
                            {group?.proposals_count}
                        </p>
                        <p className="text-3 text-gray-persist">
                            {t('groups.totalProposals')}
                        </p>
                    </div>
                </div>

                <div className="border-content-light mt-4 border-t border-b pt-4 pb-4">
                   <SegmentedBar segments={segments} />
                </div>

                <div className='border-content-light border-b pt-4 pb-4'>
                    <GroupFundingPercentages
                        amount_ada={group?.amount_awarded_ada ?? 0}
                        total_ada={group?.amount_requested_ada ?? 0}
                        amount_usd={group?.amount_awarded_usd ?? 0}
                        total_usd={group?.amount_requested_usd ?? 0}
                    />
                    <p className="text-3 text-gray-persist">
                        {t('groups.awardedVsRequested')}
                    </p>
                </div>

                <div className='border-content-light border-b pt-4 pb-4'>
                    <GroupFundingPercentages
                        amount_ada={group?.amount_distributed_ada ?? 0}
                        total_ada={group?.amount_awarded_ada ?? 0}
                        amount_usd={group?.amount_distributed_usd ?? 0}
                        total_usd={group?.amount_awarded_usd ?? 0}
                    />
                    <p className="text-3 text-gray-persist">
                        {t('groups.receivedVsAwarded')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GroupCardFull;
