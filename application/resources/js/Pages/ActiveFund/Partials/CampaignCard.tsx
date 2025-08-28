import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SecondaryButton from '@/Components/atoms/SecondaryButton';
import Title from '@/Components/atoms/Title';
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
    onCreateList?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
    fund,
    campaign,
    className,
    onCreateList,
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

    return (
        <div className={className} data-testid="campaign-card">
            <div className="bg-content-light h-60 overflow-hidden rounded-t-xl">
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

            <div className="w-full px-5 py-5">
                <Title
                    level="3"
                    className="flex items-center justify-between text-lg font-semibold"
                >
                    <Link
                        href={useLocalizedRoute(
                            'funds.fund.campaigns.campaign.show',
                            { fund: fund?.slug, campaign: campaign.slug },
                        )}
                    >
                        {campaign?.title}
                    </Link>
                </Title>

                <div className="bg-purple-light my-5 px-5 py-5">
                    <div className="flex justify-between gap-2">
                        <div>
                            <Paragraph
                                size="lg"
                                className="text-content-darker mb-1 font-bold"
                            >
                                {currency(
                                    campaign?.amount ?? 0,
                                    2,
                                    campaign?.currency?.toUpperCase() ?? 'USD',
                                )}
                            </Paragraph>
                            <Paragraph className="text-content-darker/70">
                                {t('proposals.filters.budget')}
                            </Paragraph>
                        </div>
                        <div>
                            <Paragraph
                                size="lg"
                                className="text-content-darker mb-1 font-bold"
                            >
                                {campaign?.proposals_count ?? 0}
                            </Paragraph>
                            <Paragraph className="text-content-darker/70">
                                {t('activeFund.campaigns.proposals')}
                            </Paragraph>
                        </div>
                    </div>
                </div>

                <Paragraph className="text-content-dark mb-4 line-clamp-3 opacity-80">
                    {campaign?.excerpt}
                </Paragraph>

                <div className="mt-6 flex w-full flex-col gap-4 md:flex-row">
                    <PrimaryLink
                        className="w-full md:w-2/3"
                        href={useLocalizedRoute(
                            'funds.fund.campaigns.campaign.show',
                            { fund: fund?.slug, campaign: campaign.slug },
                        )}
                    >
                        {t('activeFund.campaigns.viewProposals')}
                    </PrimaryLink>
                    <SecondaryButton
                        className="border-primary text-primary flex w-full items-center justify-center text-center md:w-1/3"
                        onClick={onCreateList}
                    >
                        {t('activeFund.campaigns.createList')}
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
