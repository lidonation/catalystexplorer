import React, { useEffect } from 'react';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import SegmentedCampaignBar from './SegmentedCampaignBar';

interface CampaignCardMiniProps {
  fund: FundData;
  campaign: CampaignData
}

const CampaignCardMini: React.FC<CampaignCardMiniProps> = ({ fund, campaign }) => {
  const { t } = useTranslation();fund

  const heroImageUrl = fund?.hero_img_url;

  return (
    <div>
      <div className="h-60 bg-content-light rounded-lg overflow-hidden">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={fund.title}
            className="h-full w-full object-cover font-semibold "
          />
        ) : (
          <div className="flex bg-primary items-center justify-center h-full">
            <span className="text-lg text-content-light">{t('developers')}</span>
          </div>
        )}
      </div>
      <div className="pt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
            {campaign?.title}
        </h3>
        <div className="flex w-full justify-between pt-4 pb-4">
                    <SegmentedCampaignBar
                        CampaignData = {campaign}
                        CompletedProposalsColor="bg-success"
                        FundedProposalsColor="bg-warning"
                        UnfundedProposalsColor="bg-primary"
                    />
                </div>
        <div className="flex gap-2">
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.filters.budget')}: {currency(campaign?.amount ?? 0, campaign?.currency?.toUpperCase() ?? 'USD', undefined, 2 )}
          </p>
        </div>
      </div>
    </div>
  );
};



export default CampaignCardMini;
