import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import SegmentedBar from '@/Components/SegmentedBar';
import { currency } from '@/utils/currency';
import { Segments } from '../../../../types/segments';
import { useTranslation } from 'react-i18next';

interface TotalsSummaryProp {
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
}

export default function UserFundSummary({ totalsSummary }: TotalsSummaryProp) {
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
                <SegmentedBar segments={segments} tooltipSegments={segments} />
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
    );
}
