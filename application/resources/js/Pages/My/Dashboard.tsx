import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import UserFundSummary from './partials/UserFundSummary';
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

    return (
        <>
            <Head title="My Dashboard" />

            {!totalsSummary && !graphData && (
                <div className="text-content text-center">
                    <RecordsNotFound />
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8 mb-8 mt-6">
                {totalsSummary && (
                    <UserFundSummary totalsSummary={totalsSummary} />
                )}
                {graphData && (
                    <>
                        <div className="h-full lg:col-span-2">
                            {(() => {
                                const awardedData = [
                                    {
                                        id: 'usd',
                                        data: graphData.amount_awarded?.USD ?? [
                                            { x: 0, y: 0 },
                                        ],
                                    },
                                    {
                                        id: 'ada',
                                        data: graphData.amount_awarded?.USD ?? [
                                            { x: 0, y: 0 },
                                        ],
                                    },
                                ].filter((item) => item.data.length > 0);

                                return (
                                    <div className="h-full lg:col-span-2">
                                        <UserSummaryChart
                                            title="communities.totalAmountAwarded"
                                            key={
                                                'communities.totalAmountAwarded'
                                            }
                                            graphData={awardedData}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="h-full lg:col-span-3">
                            {(() => {
                                const distributedData = [
                                    {
                                        id: 'usd',
                                        data: graphData.amount_received
                                            ?.USD ?? [{ x: 0, y: 0 }],
                                    },
                                    {
                                        id: 'ada',
                                        data: graphData.amount_received
                                            ?.ADA ?? [{ x: 0, y: 0 }],
                                    },
                                ].filter((item) => item.data.length > 0);

                                return (
                                    <div className="h-full lg:col-span-2">
                                        <UserSummaryChart
                                            key={
                                                'communities.totalAmountDistributed'
                                            }
                                            title="communities.totalAmountDistributed"
                                            graphData={distributedData}
                                        />
                                    </div>
                                );
                            })()}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
