import AmountComparisonWithBar from '@/Components/AmountComparisonWithBar';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;

interface CampaignCardProps {
    fund: FundData;
    campaign: CampaignData;
    className?: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
    fund,
    campaign,
    className,
}) => {
    const { t } = useLaravelReactI18n();

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
            label: 'Unfunded',
            color: 'bg-primary',
            value: campaign.unfunded_proposals_count,
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
    return (
        <div className={className} data-testid="campaign-card flex flex-col gap-4 h-full">
            <div className="bg-content-light h-60 overflow-hidden rounded-lg">
                {heroImageUrl ? (
                    <img
                        src={heroImageUrl}
                        alt={`Cat: ${fund.title}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="text-content bg-primary flex h-full items-center justify-center px-4">
                        <Title level="4">{campaign?.label}</Title>
                    </div>
                )}
            </div>

            <div className="">
                <SegmentedBar segments={segments} tooltipSegments={segments} />
            </div>

            <div className="flex flex-col">
                <Title
                    level="3"
                    className="mb-2 flex items-center justify-between text-lg font-semibold h-16"
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

                <Paragraph className="text-content-dark mb-4 line-clamp-3 opacity-80">
                    {campaign?.excerpt}
                </Paragraph>

                <div className="flex gap-2">
                    <div className="bg-background text-content rounded-md border pr-2 pl-2">
                        {t('proposals.filters.budget')}:{' '}
                        {currency(
                            campaign?.amount ?? 0,
                            2,
                            campaign?.currency?.toUpperCase() ?? 'USD',
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    {
                        <AmountComparisonWithBar
                            title="Distributed vs Awarded"
                            numerator={campaign.total_distributed ?? 0}
                            denominator={campaign.total_awarded ?? 0}
                            currency={campaign.currency ?? ''}
                        />
                    }
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
