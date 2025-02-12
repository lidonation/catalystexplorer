import Title from '@/Components/atoms/Title';
import SegmentedBar from '@/Components/SegmentedBar';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import DistributedVsAwarded from './DistributedVsAwarded';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;

interface CampaignCardProps {
    fund: FundData;
    campaign: CampaignData;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ fund, campaign }) => {
    const { t } = useTranslation();

    const heroImageUrl = fund?.hero_img_url;

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

    const formatFundString = (
        input: string | undefined,
    ): string | undefined => {
        const parts = input?.split('-'); // Split at '-'
        if (parts?.length === 2) {
            return `${parts[0].charAt(0).toUpperCase()}${parts[1]}`;
        }
        return input; // Return original if format is incorrect
    };

    useEffect(() => {
        console.log(fund);
    }, [campaign]);

    return (
        <div>
            <div className="bg-content-light h-60 overflow-hidden rounded-lg">
                {heroImageUrl ? (
                    <img
                        src={heroImageUrl}
                        alt={fund.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="text-gray-persist bg-primary flex h-full items-center justify-center">
                        {campaign?.label}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <SegmentedBar segments={segments} />
            </div>
            <div className="pt-6">
                <Title
                    level="3"
                    className="mb-2 flex items-center justify-between text-lg font-semibold"
                >
                    <Link
                        href={useLocalizedRoute(
                            'funds.fund.campaigns.campaign.show',
                            { fund: fund.slug, campaign: campaign.slug },
                        )}
                    >
                        {formatFundString(fund.slug)}: {campaign?.title}
                    </Link>
                    <svg
                        width="34"
                        height="34"
                        version="1.1"
                        viewBox="0 0 1200 1200"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="m400 350c0-27.613 22.387-50 50-50h400c27.613 0 50 22.387 50 50v400c0 27.613-22.387 50-50 50s-50-22.387-50-50v-279.29l-414.64 414.64c-19.527 19.523-51.184 19.523-70.711 0-19.527-19.527-19.527-51.184 0-70.711l414.64-414.64h-279.29c-27.613 0-50-22.387-50-50z" />
                    </svg>
                </Title>
                <p className="text-content-dark mb-4 line-clamp-3 opacity-80">
                    {campaign?.excerpt}
                </p>
                <div className="flex gap-2">
                    <p className="bg-background text-content rounded-md border pr-2 pl-2">
                        {t('proposals.filters.budget')}:{' '}
                        {currency(
                            campaign?.amount ?? 0,
                            campaign?.currency?.toUpperCase() ?? 'USD',
                            undefined,
                            2,
                        )}
                    </p>
                </div>
                <div className="mt-8">
                    <DistributedVsAwarded
                        distributed={campaign.totalDistributed}
                        awarded={campaign.totalAwarded}
                        currency={campaign?.currency ?? ''}
                    />
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
