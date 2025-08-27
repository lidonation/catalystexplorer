import ColorDot from '@/Components/atoms/ColorDot';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect } from 'react';
import ActiveFundBanner from './Partials/ActiveFundBanner';
import CampaignCard from './Partials/CampaignCard';
import Fund from '../Funds/Fund';

interface ActiveFundsProp extends Record<string, unknown> {
    search?: string | null;
    fund: App.DataTransferObjects.FundData;
    campaigns: App.DataTransferObjects.CampaignData[];
    amountDistributed: number;
    amountAwarded: number;
    amountRemaining: number;
}

const Index: React.FC<ActiveFundsProp> = ({
    search,
    fund,
    campaigns,
    amountDistributed,
    amountAwarded,
    amountRemaining,
}) => {
    const { t } = useLaravelReactI18n();

    useEffect(() => {
        console.log('fund', fund);
    });

    const segments = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: fund?.completed_proposals_count,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: fund?.funded_proposals_count,
        },
        {
            label: 'Unfunded',
            color: 'bg-primary',
            value: fund?.unfunded_proposals_count,
        },
    ] as Segments[];

    return (
        <>
            <Head title="Active Fund" />

            <header>
                <div
                    className="relative flex w-full flex-col justify-center gap-8"
                    data-testid="active-fund-page"
                >
                    <ActiveFundBanner fund={fund} />
                </div>
            </header>

            <div className="flex w-full flex-col">
                <section className="w-full px-8 py-6 flex flex-col items-center">
                    <div className="mb-5 text-center">
                        <Title level='2'>
                            {currency(fund?.amount_awarded ?? 0, 2, fund?.currency ?? 'USD')}
                        </Title>
                        <Paragraph className="text-content/70">
                            {t('activeFund.budget')}
                        </Paragraph>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center gap-4 text-center md:flex-row md:gap-16 md:text-left">
                        <Paragraph className="flex">
                            <span className="mr-1">
                                {t('activeFund.distributed')}:
                            </span>
                            <span className="font-bold">
                                {currency(amountDistributed, 2, fund?.currency ?? 'USD')}
                            </span>
                        </Paragraph>
                        <Paragraph className="flex">
                            <span className="mr-1">
                                {t('activeFund.remaining')}:
                            </span>
                            <span className="font-bold">
                                {currency(amountRemaining, 2, fund?.currency ?? 'USD')}
                            </span>
                        </Paragraph>
                    </div>
                    <div className="mt-5 flex w-full flex-col items-center justify-center gap-4">
                        <SegmentedBar
                            segments={segments}
                            tooltipSegments={segments}
                        />
                        <div className="flex gap-4">
                            {segments.map((segment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1"
                                >
                                    <ColorDot color={segment.color} size={3} />
                                    <div className="text-highlight">
                                        {segment.label}
                                    </div>
                                    <div>{segment.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className='px-8 mt-5 w-full'>
                    <Title level='3' className='mb-6'>{t('activeFund.campaignsTitle')}</Title>
                    <div className='grid md:grid-cols-2 grid-cols-1 gap-4 w-full'>
                        {
                            campaigns?.map((campaign, index)=>(
                               <CampaignCard campaign={campaign} key={index} fund={fund} className='bg-background shadow-sm rounded-xl w-full'/> 
                            ))
                        }
                    </div>
                </section>
            </div>
        </>
    );
};

export default Index;
