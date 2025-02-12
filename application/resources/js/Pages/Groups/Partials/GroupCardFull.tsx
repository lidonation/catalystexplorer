import { currency } from '@/utils/currency';
import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupFundingPercentages from './GroupFundingPercentages';
import GroupHeroSection from './GroupHeroSection';
import GroupUsers from './GroupUsers';
import GroupData = App.DataTransferObjects.GroupData;
import SegmentedBar from './SegmentedBar';

interface GroupCardFullProps {
    group: GroupData;
}

const GroupCardFull: React.FC<GroupCardFullProps> = ({ group }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-background flex w-full flex-col rounded-lg shadow-md">
            <GroupHeroSection group={group} />
            <div className="mt-4 p-3">
                <div className="flex w-full flex-col items-center gap-4">
                    <p className="text-lg font-bold">{group?.name}</p>
                </div>
                <div className='flex justify-between mt-4'>
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
                        <p className="text-1 font-bold">{group?.proposals_count}</p>
                        <p className="text-3 text-gray-persist">{t('groups.totalProposals')}</p>
                    </div>
                </div>

                <div className='mt-4 border-t border-b border-content-light pt-4 pb-4'>
                    <SegmentedBar group={group} completedProposalsColor='bg-success' fundedProposalsColor='bg-warning' unfundedProposalsColor='bg-primary'/>
                </div>

                <div>
                    {/* <GroupFundingPercentages group={group} /> */}
                    <GroupFundingPercentages group={group}/>
                </div>
            </div>
        </div>
    );
};

export default GroupCardFull;
