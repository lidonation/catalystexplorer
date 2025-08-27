import ColorDot from '@/Components/atoms/ColorDot';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import CreateListPicker from '../Bookmarks/Partials/CreateListPicker';
import ActiveFundBanner from './Partials/ActiveFundBanner';
import CampaignCard from './Partials/CampaignCard';

interface ActiveFundsProp extends Record<string, unknown> {
    search?: string | null;
    fund: App.DataTransferObjects.FundData;
    campaigns: App.DataTransferObjects.CampaignData[];
    amountDistributed: number;
    amountRemaining: number;
}

const Index: React.FC<ActiveFundsProp> = ({
    search,
    fund,
    campaigns,
    amountDistributed,
    amountRemaining,
}) => {
    const { t } = useLaravelReactI18n();
    const [showListPicker, setShowListPicker] = useState(false);
    const [campaignId, setCampaignId] = useState<string | null>('');

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
                    className="relative flex w-full"
                    data-testid="active-fund-page"
                >
                    <ActiveFundBanner fund={fund} />
                </div>
            </header>

            <div className="flex w-full flex-col">
                <section className="flex w-full flex-col items-center px-8 md:py-6 py-2">
                    <div className="md:mb-5 mb-3 text-center">
                        <Title level="2" className='hidden md:block font-bold'>
                            {currency(
                                fund?.amount_awarded ?? 0,
                                2,
                                fund?.currency ?? 'USD',
                            )}
                        </Title>
                          <Title level="3" className='md:hidden block font-bold'>
                            {currency(
                                fund?.amount_awarded ?? 0,
                                2,
                                fund?.currency ?? 'USD',
                            )}
                        </Title>
                        <Paragraph className="text-content/70">
                            {t('activeFund.budget')}
                        </Paragraph>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center md:gap-4 gap-2 text-center md:flex-row md:gap-16 md:text-left">
                        <Paragraph className="flex">
                            <span className="mr-1">
                                {t('activeFund.distributed')}:
                            </span>
                            <span className="font-bold">
                                {currency(
                                    amountDistributed,
                                    2,
                                    fund?.currency ?? 'USD',
                                )}
                            </span>
                        </Paragraph>
                        <Paragraph className="flex">
                            <span className="mr-1">
                                {t('activeFund.remaining')}:
                            </span>
                            <span className="font-bold">
                                {currency(
                                    amountRemaining,
                                    2,
                                    fund?.currency ?? 'USD',
                                )}
                            </span>
                        </Paragraph>
                    </div>
                    <div className="md:mt-5 mt-4 flex w-full flex-col items-center justify-center md:gap-4 gap-2">
                        <SegmentedBar
                            segments={segments}
                            tooltipSegments={segments}
                        />
                        <div className="flex gap-4 px-4 md:px-0">
                            {segments.map((segment, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1"
                                >
                                    <ColorDot color={segment.color} size={3} />
                                    <div className="text-highlight text-sm">
                                        {segment.label}
                                    </div>
                                    <div className='text-sm'>{segment.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="mt-5 w-full px-8">
                    <Title level="3" className="mb-6 font-bold">
                        {t('activeFund.campaignsTitle')}
                    </Title>
                    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                        {campaigns?.map((campaign, index) => (
                            <CampaignCard
                                campaign={campaign}
                                key={index}
                                fund={fund}
                                className="bg-background w-full rounded-xl shadow-sm"
                                onCreateList={() => {
                                    setShowListPicker(true);
                                    setCampaignId(campaign?.id);
                                }}
                            />
                        ))}
                    </div>
                </section>
            </div>
            <CreateListPicker
                showPickingList={showListPicker}
                setPickingList={setShowListPicker}
                context='funds'
                campaign={campaignId}
            ></CreateListPicker>
        </>
    );
};

export default Index;
