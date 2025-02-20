import AmountComparisonWithBar from '@/Components/AmountComparisonWithBar';
import Title from '@/Components/atoms/Title';
import SegmentedBar from '@/Components/SegmentedBar';
import {currency} from '@/utils/currency';
import {useLocalizedRoute} from '@/utils/localizedRoute';
import {Link} from '@inertiajs/react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Segments} from '../../../../types/segments';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import Paragraph from "@/Components/atoms/Paragraph";
import ColorDot from "@/Components/atoms/ColorDot";
import KeyValue from "@/Components/atoms/KeyValue";
import Divider from "@/Components/Divider";
import Card from "@/Components/Card";

interface CampaignCardProps {
    fund: FundData;
    campaign: CampaignData;
    className?: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
   fund,
   campaign,
   className
}) => {
    const {t} = useTranslation();

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
        <Card className={className}>
            <div className={`flex flex-col gap-6 card-campaign`}>
                <section className="bg-content-light h-52 overflow-hidden rounded-lg">
                    {heroImageUrl ? (
                        <img
                            src={heroImageUrl}
                            alt={fund.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="text-content bg-primary h-full flex items-center justify-center px-4">
                            <Title level="4">{campaign?.label}</Title>
                        </div>
                    )}
                </section>

                <section className="space-y-6">
                    <div className='flex flex-row justify-between gap-2'>
                        <KeyValue valueKey={t('proposals.filters.budget')}
                                  value={currency(campaign.amount, 2, campaign.currency)}/>
                        <KeyValue valueKey='Total Proposals' value={campaign.proposals_count}/>
                    </div>

                    <div>
                        <Divider/>
                    </div>

                    <div className='space-y-3'>
                        <div>
                            <SegmentedBar segments={segments}/>
                        </div>

                        <div className="flex flex-row flex-wrap gap-2 justify-between text-sm px-0.5">
                            {segments.map((segment, index) => (
                                <div key={index} className='flex flex-row items-center gap-1'>
                                    <ColorDot color={segment.color} size={3}/>
                                    <div className='text-highlight'>{segment.label}</div>
                                    <div>{segment.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <Title
                        level="3"
                        className="mb-2 flex items-center justify-between text-lg font-semibold card-title"
                    >
                        <Link
                            href={useLocalizedRoute(
                                'funds.fund.campaigns.campaign.show',
                                {fund: fund.slug, campaign: campaign.slug},
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
                            <path
                                d="m400 350c0-27.613 22.387-50 50-50h400c27.613 0 50 22.387 50 50v400c0 27.613-22.387 50-50 50s-50-22.387-50-50v-279.29l-414.64 414.64c-19.527 19.523-51.184 19.523-70.711 0-19.527-19.527-19.527-51.184 0-70.711l414.64-414.64h-279.29c-27.613 0-50-22.387-50-50z"/>
                        </svg>
                    </Title>

                    <Paragraph className="text-content-dark mb-4 line-clamp-5 opacity-80 card-summary">
                        {campaign?.excerpt}
                    </Paragraph>

                    <div className="mt-6">
                        {(campaign.total_distributed && campaign.total_awarded) && <AmountComparisonWithBar
                            title={`${t('distributed')} v. ${t('awarded')}`}
                            numerator={campaign.total_distributed}
                            denominator={campaign.total_awarded}
                            currency={campaign.currency}
                        />}
                    </div>

                    <div className="mt-6">
                        {(campaign.total_requested && campaign.total_awarded) && <AmountComparisonWithBar
                            title={`${t('awarded')} v. ${t('requested')}`}
                            numerator={campaign.total_awarded}
                            denominator={campaign.total_requested}
                            currency={campaign.currency}
                        />}
                    </div>
                </section>
            </div>
        </Card>
    );
};

export default CampaignCard;
