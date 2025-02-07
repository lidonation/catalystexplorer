import React from 'react';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import {Link} from "@inertiajs/react";
import {useLocalizedRoute} from "@/utils/localizedRoute";

interface CampainCardProps {
  fund: FundData;
  campaign: CampaignData
}

const CampaignCard: React.FC<CampainCardProps> = ({ fund, campaign }) => {
  const { t } = useTranslation();

  const heroImageUrl = fund?.hero_img_url;

  return (
    <div>
      <div className="h-60 bg-content-light rounded-lg overflow-hidden">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt={fund.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-persist bg-primary">
            {campaign?.label}
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
        <p className="text-content-dark opacity-80 mb-4 line-clamp-3">
          {campaign?.excerpt}
        </p>
        <div className="flex gap-2">
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.proposals')}: {campaign?.proposals_count ?? 0}
          </p>
          <p className="bg-background text-content rounded-md border pr-2 pl-2">
            {t('proposals.filters.budget')}: {currency(campaign?.amount ?? 0, campaign?.currency?.toUpperCase() ?? 'USD', undefined, 2 )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
