import Paragraph from '@/Components/atoms/Paragraph';
import Card from '@/Components/Card';
import FundingPercentages from '@/Components/FundingPercentages';
import SegmentedBar from '@/Components/SegmentedBar';
import { Segments } from '@/types/segments';
import { currency } from '@/utils/currency';
import { usePage } from '@inertiajs/react';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import GroupData = App.DataTransferObjects.GroupData;

interface BioCardProps {
    group: GroupData;
}

const BioCard: React.FC<BioCardProps> = ({ group }) => {
    const { t } = useLaravelReactI18n();

    const { locale } = usePage().props;

    const segments = [
        {
            label: t('groups.completed'),
            color: 'bg-success',
            value: group.completed_proposals_count,
        },
        {
            label: t('groups.funded'),
            color: 'bg-warning',
            value: group.funded_proposals_count,
        },
        {
            label: t('groups.unfunded'),
            color: 'bg-primary',
            value: group.unfunded_proposals_count,
        },
    ] as Segments[];

    const noAwardedFunds =
        !group?.amount_awarded_ada && !group?.amount_awarded_usd;
    const allAwardedFunds = !!(
        group?.amount_awarded_ada && group?.amount_awarded_usd
    );

    return (
        <Card>
            <div>
                <Paragraph className="border-dark border-b pt-2 pb-3 font-bold">
                    {t('bio')}
                </Paragraph>
                <Paragraph className="text-content-dark mb-4 line-clamp-3 pt-4 opacity-80">
                    {group?.bio}
                </Paragraph>
                <div className="flex flex-col gap-2">
                    <div className="border-dark flex justify-between border-b pb-4">
                        <div>
                            <Paragraph className="text-xl font-bold">
                                {currency(
                                    group?.amount_requested_ada ?? 0,
                                    2,
                                    'ADA',
                                )}{' '}
                                +{' '}
                                {currency(
                                    group?.amount_requested_usd ?? 0,
                                    2,
                                    'USD',
                                )}
                            </Paragraph>
                            <Paragraph className="text-dark">
                                {t('groups.totalRequested')}
                            </Paragraph>
                        </div>
                        <div>
                            <Paragraph className="text-xl font-bold">
                                {group?.proposals_count ?? 0}
                            </Paragraph>
                            <Paragraph className="text-dark">
                                {t('proposals.proposals')}
                            </Paragraph>
                        </div>
                    </div>
                </div>
                <div className="border-dark border-b pt-4 pb-4">
                    <SegmentedBar
                        segments={segments}
                        tooltipSegments={segments}
                    />
                </div>

                <div
                    className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
                >
                    {(group?.amount_awarded_ada || noAwardedFunds) && (
                        <div>
                            <FundingPercentages
                                amount={group?.amount_awarded_ada ?? 0}
                                total={group?.amount_requested_ada ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                        </div>
                    )}
                    {(group?.amount_awarded_usd || noAwardedFunds) && (
                        <FundingPercentages
                            amount={group?.amount_awarded_usd ?? 0}
                            total={group?.amount_requested_usd ?? 0}
                            primaryBackgroundColor="bg-content-light"
                            secondaryBackgroundColor="bg-primary-dark"
                            amount_currency="USD"
                        />
                    )}
                </div>
                <Paragraph className="text-dark border-b pt-4 pb-4">
                    {t('groups.awardedVsRequested')}
                </Paragraph>

                <div
                    className={`grid ${noAwardedFunds || allAwardedFunds ? 'grid-cols-2' : 'grid-cols-1'} mt-4 gap-4`}
                >
                    {(group?.amount_awarded_ada || noAwardedFunds) && (
                        <div>
                            <FundingPercentages
                                amount={group?.amount_distributed_ada ?? 0}
                                total={group?.amount_awarded_ada ?? 0}
                                primaryBackgroundColor="bg-content-light"
                                secondaryBackgroundColor="bg-primary"
                                amount_currency="ADA"
                            />
                        </div>
                    )}
                    {(group?.amount_awarded_usd || noAwardedFunds) && (
                        <FundingPercentages
                            amount={group?.amount_distributed_usd ?? 0}
                            total={group?.amount_awarded_usd ?? 0}
                            primaryBackgroundColor="bg-content-light"
                            secondaryBackgroundColor="bg-primary-dark"
                            amount_currency="USD"
                        />
                    )}
                </div>
                <Paragraph className="text-dark mb-4 border-b pt-4 pb-4">
                    {t('groups.receivedVsAwarded')}
                </Paragraph>
            </div>
        </Card>
    );
};

export default BioCard;
