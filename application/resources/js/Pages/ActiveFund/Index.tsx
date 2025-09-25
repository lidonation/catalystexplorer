import ColorDot from '@/Components/atoms/ColorDot';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import SecondaryLink from '@/Components/SecondaryLink.tsx';
import SegmentedBar from '@/Components/SegmentedBar';
import { CatalystFundsEnums } from '@/enums/catalyst-funds-enums.ts';
import { ParamsEnum } from '@/enums/proposal-search-params.ts';
import SupportCxBanner from '@/Pages/ActiveFund/Partials/SupportCxBanner.tsx';
import ProposalList from '@/Pages/Proposals/Partials/ProposalList.tsx';
import VerticalCardLoading from '@/Pages/Proposals/Partials/ProposalVerticalCardLoading.tsx';
import QuickPitchList from '../Home/Partials/QuickPitches/QuickPitchList';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { useLocalizedRoute } from '@/utils/localizedRoute.ts';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useState } from 'react';
import ActiveFundBanner from './Partials/ActiveFundBanner';
import CampaignCard from './Partials/CampaignCard';
import CreateListBanner from './Partials/CreateListBanner';
import FundTalliesWidget from './Partials/FundTalliesWidget';
import ProposalData = App.DataTransferObjects.ProposalData;
import { PaginatedData } from '@/types/paginated-data';

interface VotingStatsItem extends App.DataTransferObjects.VoterData {
    fund_ranking?: number;
    latest_proposal?: App.DataTransferObjects.ProposalData;
}

interface ActiveFundsProp extends Record<string, unknown> {
    search?: string | null;
    fund: App.DataTransferObjects.FundData;
    campaigns: App.DataTransferObjects.CampaignData[];
    funds?: any[];
    proposals: ProposalData[];
    amountDistributed: number;
    amountRemaining: number;
    tallies?: PaginatedData<VotingStatsItem[]> & { last_updated?: string };
    filters?: Record<string, unknown>;
    quickPitches?: {
        featured: ProposalData[];
        regular: ProposalData[];
    };
}

const Index: React.FC<ActiveFundsProp> = ({
    search,
    fund,
    campaigns,
    funds,
    proposals,
    amountDistributed,
    amountRemaining,
    tallies,
    filters,
    quickPitches,
}) => {
    const { t } = useLaravelReactI18n();
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

    const proposalAttrs = {
        quickPitchView: true,
    };

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

            <div className="flex w-full flex-col pb-4">
                <section className="flex w-full flex-col items-center px-8 py-2 md:py-4">
                    <div className="text-center">
                        <Title level="2" className="hidden font-bold md:block">
                            {currency(
                                fund?.amount_awarded ?? 0,
                                2,
                                fund?.currency ?? 'USD',
                            )}
                        </Title>
                        <Title level="3" className="block font-bold md:hidden">
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
                    <div className="flex w-full flex-col items-center justify-center gap-2 text-center md:flex-row md:gap-4 md:gap-16 md:text-left">
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
                    <div className="flex w-full flex-col items-center justify-center gap-2">
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
                                    <div className="text-sm">
                                        {segment.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="my-4 w-full px-8">
                    <CreateListBanner />
                </section>

                <section
                    className="quickpitches-wrapper"
                    data-testid="quickpitches-section"
                >
                    <div className="m-8">
                        <Title level="2" className='mb-6'>{t('home.quickpitchTitle')}</Title>
                        <QuickPitchList quickPitches={quickPitches} />
                    </div>
                </section>

                <section className="my-4 mt-8 w-full px-8">
                    <SupportCxBanner />
                </section>

                <section className="mt-5 w-full px-8">
                    <FundTalliesWidget
                        tallies={tallies}
                        campaigns={campaigns}
                        funds={funds}
                        showPagination={true}
                        showFilters={true}
                        filters={{}}
                        routerOptions={{ 
                            only: ['tallies'],
                            preserveState: true,
                            preserveScroll: true 
                        }}
                        customTitle={t('activeFund.votingStats')}
                        lastUpdated={tallies?.last_updated}
                    />
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
                            />
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
};

export default Index;
