import AmountComparisonWithBar from '@/Components/AmountComparisonWithBar';
import Divider from '@/Components/Divider';
import SegmentedBar from '@/Components/SegmentedBar';
import { PageProps } from '@/types';
import { currencySymbol } from '@/utils/currencySymbol';
import { shortNumber } from '@/utils/shortNumber';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import FundData = App.DataTransferObjects.FundData;
import CampaignData = App.DataTransferObjects.CampaignData;
import ProposalData = App.DataTransferObjects.ProposalData;

interface SinglePageCampaignCardPageProps extends Record<string, unknown> {
    fund: FundData;
    campaign: CampaignData;
}

export default function SinglePageCampaignCard({
    fund,
    campaign,
}: PageProps<SinglePageCampaignCardPageProps>) {
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

    return (
        <>
            <div className="bg-background sticky top-5 flex flex-col gap-2 rounded-sm p-2">
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
                <div className="w-full p-2">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-1">
                            <span className="text-content text-2xl font-bold">
                                {shortNumber(campaign.total_requested)}{' '}
                                {currencySymbol(campaign.currency)}
                            </span>
                            <span className="text-content-dark mb-4 line-clamp-3 opacity-80">
                                {t('Total Requested')}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-content text-2xl font-bold">
                                {shortNumber(campaign.proposals_count)}
                            </span>
                            <span className="text-content-dark mb-4 line-clamp-3 opacity-80">
                                {t('Total Proposals')}
                            </span>
                        </div>
                    </div>
                    <Divider />
                    <div className="my-4 py-2">
                        <SegmentedBar segments={segments} />
                    </div>
                    <Divider />
                    <div className="py-4">
                        <AmountComparisonWithBar
                            title="Awarded vs Requested"
                            numerator={campaign.total_awarded}
                            denominator={campaign.total_requested}
                            currency={campaign.currency}
                            smallSize={true}
                            onWhiteBackground={true}
                        />
                    </div>
                    <Divider />
                    <div className="py-4">
                        <AmountComparisonWithBar
                            title="Distributed vs Awarded"
                            numerator={campaign.total_distributed}
                            denominator={campaign.total_awarded}
                            currency={campaign.currency}
                            smallSize={true}
                            onWhiteBackground={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
