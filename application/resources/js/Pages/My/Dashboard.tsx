import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import SegmentedBar from '@/Components/SegmentedBar';
import MyLayout from '@/Pages/My/MyLayout';
import { currency } from '@/utils/currency';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../types/segments';
import UserSummaryChart from './partials/UserSummaryChart';

interface MyDashboardProps {
    totalsSummary: {
        completed_proposals_count: number;
        funded_proposals_count: number;
        unfunded_proposals_count: number;
        own_proposals_count: number;
        collaborating_proposals_count: number;
        proposals_count: number;
        amount_requested_ada: number;
        amount_requested_usd: number;
    };
    graphData: {
        amount_awarded: {
            USD: { x: number; y: number }[];
            ADA: { x: number; y: number }[];
        };
        amount_received: {
            USD: { x: number; y: number }[];
            ADA: { x: number; y: number }[];
        };
    };
}

export default function MyDashboard({
    totalsSummary,
    graphData,
}: MyDashboardProps) {
    const { t } = useTranslation();
    const segments = [
        {
            label: t('segments.completed'),
            color: 'bg-success',
            value: totalsSummary.completed_proposals_count,
        },
        {
            label: t('segments.funded'),
            color: 'bg-warning',
            value: totalsSummary.funded_proposals_count,
        },
        {
            label: t('segments.unfunded'),
            color: 'bg-primary',
            value: totalsSummary.unfunded_proposals_count,
        },
    ] as Segments[];

    return (
        <MyLayout>
            <Head title="My Dashboard" />

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pt-8 sm:px-6 lg:grid-cols-3 lg:px-8">
                {/* <div className="text-content text-center">
                    <RecordsNotFound />
                </div> */}
                <Card className="bg-background flex h-full w-full flex-col gap-4 rounded-lg shadow-md">
                    <Title
                        level="4"
                        className="text-content-gray-persist border-content-light border-b pb-4 font-medium font-semibold"
                    >
                        {t('proposals.proposalSummary')}
                    </Title>

                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">
                            {!!totalsSummary?.amount_requested_ada
                                ? currency(
                                      totalsSummary?.amount_requested_ada ?? 0,
                                      2,
                                      'ADA',
                                  )
                                : ''}

                            {totalsSummary?.amount_requested_usd &&
                            totalsSummary?.amount_requested_ada
                                ? ' ' + ' '
                                : ''}

                            {!!totalsSummary?.amount_requested_usd
                                ? currency(
                                      totalsSummary?.amount_requested_usd ?? 0,
                                      2,
                                      'USD',
                                  )
                                : ''}
                        </span>
                        <span className="text-dark">
                            {t('proposals.totalRequested')}
                        </span>
                    </div>

                    <div className="border-content-light border-b pb-4">
                        <SegmentedBar
                            segments={segments}
                            tooltipSegments={segments}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex gap-8">
                            <span>{t('proposals.owner')}</span>
                            <span className="font-semibold">
                                {totalsSummary.own_proposals_count}
                            </span>
                        </div>
                        <div className="flex gap-8">
                            <span>{t('ideascaleProfiles.collaborator')}</span>
                            <span className="font-semibold">
                                {totalsSummary.collaborating_proposals_count}
                            </span>
                        </div>
                    </div>
                </Card>
                <div className="h-full lg:col-span-2">
                    {(() => {
                        const awardedData = [
                            {
                                id: 'usd',
                                data: graphData.amount_awarded.USD ?? [],
                            },
                            {
                                id: 'ada',
                                data: graphData.amount_awarded.ADA ?? [],
                            },
                        ].filter((item) => item.data.length > 0);

                        const awardedFilter = awardedData.map(
                            (item) => item.id,
                        );

                        return (
                            <div className="h-full lg:col-span-2">
                                <UserSummaryChart
                                    title="communities.totalAmountAwarded"
                                    graphData={awardedData}
                                    defaultFilter={awardedFilter}
                                />
                            </div>
                        );
                    })()}
                </div>
                <div className="h-full lg:col-span-2">
                    {(() => {
                        const distributedData = [
                            {
                                id: 'usd',
                                data: graphData.amount_received.USD ?? [],
                            },
                            {
                                id: 'ada',
                                data: graphData.amount_received.ADA ?? [],
                            },
                        ].filter((item) => item.data.length > 0);

                        const distributedFilter = distributedData.map(
                            (item) => item.id,
                        );

                        console.log({ distributedFilter });
                        

                        return (
                            <div className="h-full lg:col-span-2">
                                <UserSummaryChart
                                    title="communities.totalAmountDistributed"
                                    graphData={distributedData}
                                    defaultFilter={distributedFilter}
                                />
                            </div>
                        );
                    })()}
                </div>
            </div>
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 pt-8 sm:px-6 lg:grid-cols-3 lg:px-8"></div>
        </MyLayout>
    );
}
