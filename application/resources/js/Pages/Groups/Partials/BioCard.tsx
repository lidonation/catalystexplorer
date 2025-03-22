import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupData = App.DataTransferObjects.GroupData;
import Card from "@/Components/Card";
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '../../../../types/segments';
<<<<<<< HEAD
import GroupFundingPercentages from './GroupFundingPercentages';
import Paragraph from '@/Components/atoms/Paragraph';
=======
import Paragraph from '@/Components/atoms/Paragraph';
import FundingPercentages from '@/Components/FundingPercentages';
import { currency } from '@/utils/currency';
>>>>>>> origin/dev

interface BioCardProps {
  group: GroupData;
}

const BioCard: React.FC<BioCardProps> = ({ group }) => {
  const { t } = useTranslation();
  const segments = [
    {
      label: t('groups.completed'),
      color: 'bg-success',
      value: group.completed_proposals_count,
    },
    {
      label: t('groups.funded'),
      color: 'bg-warning',
      value: group.funded_proposals_count,
    },
    {
      label: t('groups.unfunded'),
      color: 'bg-primary',
      value: group.unfunded_proposals_count,
    },
  ] as Segments[];

  const noAwardedFunds =
    !group?.amount_awarded_ada && !group?.amount_awarded_usd;
  const allAwardedFunds = !!(
    group?.amount_awarded_ada && group?.amount_awarded_usd
  );

  return (
    <Card>
      <div>
<<<<<<< HEAD
        <Paragraph className='border-b border-dark pb-3 pt-2'>{t('bio')}</Paragraph>
=======
        <Paragraph className='border-b border-dark pb-3 pt-2 font-bold'>{t('bio')}</Paragraph>
>>>>>>> origin/dev
        <Paragraph className="text-content-dark opacity-80 mb-4 line-clamp-3 pt-4">{group?.bio}</Paragraph>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between border-b pb-4 border-dark'>
            <div>
              <Paragraph className='text-xl font-bold'>
<<<<<<< HEAD
                {group?.amount_requested_ada} + {group?.amount_requested_usd}
=======
                {currency(group?.amount_requested_ada ?? 0, 2, 'ADA')} + {currency(group?.amount_requested_usd ?? 0, 2, 'USD')}
>>>>>>> origin/dev
              </Paragraph>
              <Paragraph className='text-dark'>{t('groups.totalRequested')}</Paragraph>
            </div>
            <div>
              <Paragraph className='text-xl font-bold'>{group?.proposals_count ?? 0}</Paragraph>
              <Paragraph className='text-dark'>{t('proposals.proposals')}</Paragraph>
            </div>
          </div>
        </div>
        <div className='border-b pb-4 pt-4 border-dark'>
<<<<<<< HEAD
          <SegmentedBar segments={segments}/>
=======
          <SegmentedBar segments={segments} tooltipSegments={segments}/>
>>>>>>> origin/dev
        </div>

        <div
          className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
        >
          {(group?.amount_awarded_ada || noAwardedFunds) && (
            <div>
<<<<<<< HEAD
              <GroupFundingPercentages
=======
              <FundingPercentages
>>>>>>> origin/dev
                amount={group?.amount_awarded_ada ?? 0}
                total={group?.amount_requested_ada ?? 0}
                primaryBackgroundColor="bg-content-light"
                secondaryBackgroundColor="bg-primary"
                amount_currency="ADA"
<<<<<<< HEAD
                isMini={true}
                twoColumns={noAwardedFunds || allAwardedFunds}
=======
>>>>>>> origin/dev
              />
            </div>
          )}
          {(group?.amount_awarded_usd || noAwardedFunds) && (
<<<<<<< HEAD
            <GroupFundingPercentages
=======
            <FundingPercentages
>>>>>>> origin/dev
              amount={group?.amount_awarded_usd ?? 0}
              total={group?.amount_requested_usd ?? 0}
              primaryBackgroundColor="bg-content-light"
              secondaryBackgroundColor="bg-primary-dark"
              amount_currency="USD"
<<<<<<< HEAD
              isMini={true}
              twoColumns={noAwardedFunds || allAwardedFunds}
=======
>>>>>>> origin/dev
            />
          )}
        </div>
        <Paragraph className='pt-4 text-dark border-b pb-4'>{t('groups.awardedVsRequested')}</Paragraph>

        <div
          className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
        >
          {(group?.amount_awarded_ada || noAwardedFunds) && (
            <div>
<<<<<<< HEAD
              <GroupFundingPercentages
=======
              <FundingPercentages
>>>>>>> origin/dev
                amount={group?.amount_distributed_ada ?? 0}
                total={group?.amount_awarded_ada ?? 0}
                primaryBackgroundColor="bg-content-light"
                secondaryBackgroundColor="bg-primary"
                amount_currency="ADA"
<<<<<<< HEAD
                isMini={true}
                twoColumns={noAwardedFunds || allAwardedFunds}
=======
>>>>>>> origin/dev
              />
            </div>
          )}
          {(group?.amount_awarded_usd || noAwardedFunds) && (
<<<<<<< HEAD
            <GroupFundingPercentages
=======
            <FundingPercentages
>>>>>>> origin/dev
              amount={group?.amount_distributed_usd ?? 0}
              total={group?.amount_awarded_usd ?? 0}
              primaryBackgroundColor="bg-content-light"
              secondaryBackgroundColor="bg-primary-dark"
              amount_currency="USD"
<<<<<<< HEAD
              isMini={true}
              twoColumns={noAwardedFunds || allAwardedFunds}
=======
>>>>>>> origin/dev
            />
          )}
        </div>
        <Paragraph className='border-b pt-4 pb-4 mb-4 text-dark'>{t('groups.receivedVsAwarded')}</Paragraph>
      </div>
    </Card>
  );
};

export default BioCard;
