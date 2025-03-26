import Card from '@/Components/Card';
import SegmentedBar from '@/Components/SegmentedBar';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { currency } from '@/utils/currency';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import CommunityData = App.DataTransferObjects.CommunityData;

interface ProposalSummaryCardProps {
    community: CommunityData;
    ownProposalsCount: number;
    coProposalsCount: number;
}

export default function ProposalSummaryCard({
    community,
    ownProposalsCount,
    coProposalsCount
}: ProposalSummaryCardProps) {
    const { t } = useTranslation();

    const segments = [
        {
            label: t('segments.completed'),
            color: 'bg-success',
            value: community?.completed_proposals_count,
        },
        {
            label: t('segments.funded'),
            color: 'bg-warning',
            value: community?.funded_proposals_count,
        },
        {
            label: t('segments.unfunded'),
            color: 'bg-primary',
            value: community?.proposals_count,
        },
    ] as Segments[];
    return (
        <Card>
            <div className="border-background-lighter border-b-2">
                <Title level="5" className="mb-2 font-bold">
                    {t('communities.proposalSummary')}
                </Title>
            </div>
            <div className="text-3">
                <Title
                    className="font-bold"
                    level="3"
                >{`${currency(community?.amount_awarded_ada ?? 0, 2, 'ADA')} + ${currency(community?.amount_awarded_usd ?? 0, 2, 'USD')}`}</Title>
                <Paragraph className="text-gray-persist">
                    {t('communities.totalRequested')}
                </Paragraph>
            </div>
            <div className="border-background-lighter mt-4 mb-4 border-b-2 pb-4">
                <SegmentedBar segments={segments} tooltipSegments={segments} />
            </div>
            <div>
                <Paragraph className="flex items-center mb-1">
                    <span className='w-32'>{t('communities.proposers')}</span>
                    <span className='font-bold'>{ownProposalsCount}</span>
                </Paragraph>

                <Paragraph className="flex items-center">
                    <span className='w-32'>{t('communities.collaborators')}</span>
                    <span className='font-bold'>{coProposalsCount}</span>
                </Paragraph>
            </div>
        </Card>
    );
}
