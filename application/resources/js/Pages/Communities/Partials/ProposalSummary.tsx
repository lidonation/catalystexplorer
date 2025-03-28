import Card from '@/Components/Card';
import SegmentedBar from '@/Components/SegmentedBar';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { currency } from '@/utils/currency';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Segments } from '../../../../types/segments';
import CommunityData = App.DataTransferObjects.CommunityData;
import Value from "@/Components/atoms/Value";
import ValueLabel from "@/Components/atoms/ValueLabel";
import CommunityIdeascaleProfiles from "@/Pages/Communities/Partials/CommunityIdeascaleProfiles";
import KeyValue from "@/Components/atoms/KeyValue";

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

    const segmentsLegend = [
        {
            label: 'Completed',
            color: 'bg-success',
            value: community.completed_proposals_count,
        },
        {
            label: 'Funded',
            color: 'bg-warning',
            value: community.funded_proposals_count,
        },
        {
            label: 'Submitted',
            color: 'bg-primary',
            value: community.proposals_count,
        },
    ] as Segments[];

    return (
        <Card className='h-full'>
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
                <SegmentedBar segments={segments} tooltipSegments={segments}/>
                <ul className="mt-2 flex w-full flex-wrap gap-x-4">
                    {segmentsLegend.map((segment, index) => (
                        <li key={index} className="mt-2">
                            <div
                                className={`mt-1 h-2 w-2 rounded-full ${segment.color}`}
                            />
                            <div className="mt-2 flex justify-between">
                                <Paragraph
                                    size="sm"
                                    className="text-gray-persist mr-1"
                                >
                                    {segment.label}:
                                </Paragraph>
                                <Paragraph className="font-bold" size="sm">
                                    {segment.value}
                                </Paragraph>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className='flex flex-col gap-3'>
                <div className="flex justify-between items-center mb-1">
                    <ValueLabel className='shrink'>{t('communities.proposers')}</ValueLabel>
                    <CommunityIdeascaleProfiles
                        ideascaleProfiles={community.ideascale_profiles}
                        total={community.ideascale_profiles_count}
                    />
                </div>

                <div className="flex justify-between items-center mb-1">
                    <ValueLabel className='shrink'>{t('communities.proposals')}</ValueLabel>
                    <Value className='font-bold shrink'>{community.proposals_count}</Value>
                </div>
            </div>
        </Card>
    );
}
