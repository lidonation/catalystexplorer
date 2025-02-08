<<<<<<< HEAD
import React, { useEffect } from 'react';
=======
import React from 'react';
>>>>>>> ef37c41f0da86cfc949d25ab279ac5e2131bb6b8
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
<<<<<<< HEAD
import SegmentedCampaignBar from './SegmentedCampaignBar';
=======
import SegmentedBar from '@/Pages/IdeascaleProfile/Partials/SegmentedProgressBar';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import {Link} from "@inertiajs/react";
import {useLocalizedRoute} from "@/utils/localizedRoute";
>>>>>>> ef37c41f0da86cfc949d25ab279ac5e2131bb6b8

interface CampaignCardMiniProps {
  fund: FundData;
  campaign: CampaignData
}

const CampaignCardMini: React.FC<CampaignCardMiniProps> = ({ fund, campaign }) => {
<<<<<<< HEAD
  const { t } = useTranslation();fund
=======
  const { t } = useTranslation();
  const rawData : unknown = fund;
  const fundData :IdeascaleProfileData = rawData as IdeascaleProfileData;
>>>>>>> ef37c41f0da86cfc949d25ab279ac5e2131bb6b8

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
<<<<<<< HEAD
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
=======
          <div className="flex bg-primary items-center justify-center h-full w-full">
            <span className="text-lg text-content-light px-4">{campaign?.label}</span>
          </div>
        )}
      </div>

      <div className="pt-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
            <Link href={useLocalizedRoute('funds.fund.campaigns.campaign.show', {fund: fund.slug, campaign: campaign.slug})}>{campaign?.title}</Link>
            <svg width="34" height="34" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
                <path d="m400 350c0-27.613 22.387-50 50-50h400c27.613 0 50 22.387 50 50v400c0 27.613-22.387 50-50 50s-50-22.387-50-50v-279.29l-414.64 414.64c-19.527 19.523-51.184 19.523-70.711 0-19.527-19.527-19.527-51.184 0-70.711l414.64-414.64h-279.29c-27.613 0-50-22.387-50-50z"/>
            </svg>
        </h3>

        <div className="flex w-full justify-between pt-4 pb-4">
            <SegmentedBar
                IdeascaleProfileData = {fundData}
                CompletedProposalsColor="bg-success"
                FundedProposalsColor="bg-warning"
                UnfundedProposalsColor="bg-primary"
            />
        </div>

        <p className="text-content-dark opacity-80 mb-4 line-clamp-3">
          {campaign?.excerpt}
        </p>

        <div className="flex gap-2">
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.proposals')}: {campaign?.proposals_count ?? 0}
          </p>
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
>>>>>>> ef37c41f0da86cfc949d25ab279ac5e2131bb6b8
            {t('proposals.filters.budget')}: {currency(campaign?.amount ?? 0, campaign?.currency?.toUpperCase() ?? 'USD', undefined, 2 )}
          </p>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD


=======
>>>>>>> ef37c41f0da86cfc949d25ab279ac5e2131bb6b8
export default CampaignCardMini;
