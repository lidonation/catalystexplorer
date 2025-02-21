import React from 'react';
import {currency} from '@/utils/currency';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import {useTranslation} from 'react-i18next';
import SegmentedBar from '@/Components/SegmentedBar'
import Title from '@/Components/atoms/Title';
import {Segments} from '../../../../types/segments';

interface CampaignCardMiniProps {
    fund: FundData;
    campaign: CampaignData;
}

const CampaignCardMini: React.FC<CampaignCardMiniProps> = ({fund, campaign}) => {
    const {t} = useTranslation();

    const heroImageUrl = campaign?.hero_img_url ?? fund?.hero_img_url;
    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: campaign.completed_proposals_count,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: campaign.funded_proposals_count,
        },
        {
            label: 'Submitted',
            color: 'bg-primary',
            value: campaign.proposals_count,
        },
    ] as Segments[];

    return (
        <div>
            <div className="h-60 bg-content-light rounded-lg overflow-hidden">
                {heroImageUrl ? (
                    <img
                        src={heroImageUrl}
                        alt={fund.title}
                        className="h-full w-full object-cover font-semibold"
                    />
                ) : (
                    <div className="flex bg-primary items-center justify-center h-full">
                        <span className="text-lg text-content-light">{t('developers')}</span>
                    </div>
                )}
            </div>
            <div className="pt-6">
                <Title level="3" className="text-lg font-semibold mb-2 flex items-center justify-between">
                    {campaign?.title}
                </Title>

                <div className="mt-4">
                    <SegmentedBar segments={segments}/>
                </div>
                <div className="flex gap-2">
                    <p className="bg-background text-content rounded-md border px-2">
                        {t('proposals.filters.budget')}: {currency(campaign?.amount ?? 0, 2, campaign?.currency?.toUpperCase() ?? 'USD')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CampaignCardMini;
