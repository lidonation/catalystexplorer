import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Card from '@/Components/Card';
import ProjectCatalystLogo from '@/Components/svgs/ProjectCatalystLogo';
import { linksEnum } from '@/enums/links-enum';
import { getUpcomingPaymentData } from '@/useHooks/useUpcomingPayments';
import { currency } from '@/utils/currency';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ProposalMetadataWidgetSection from './ProposalMetadataWidgetSection';

interface FundingProgressWidgetProps {
    proposal: App.DataTransferObjects.ProposalData;
}

export default function FundingProgressWidget({
    proposal,
}: FundingProgressWidgetProps) {
    const { t } = useLaravelReactI18n();

    const amountRemaining =
        (proposal?.amount_requested ?? 0) - (proposal?.amount_received ?? 0);
    const percentageFunded = proposal?.amount_requested
        ? ((proposal.amount_received ?? 0) / proposal.amount_requested) * 100
        : 0;

    const ledger = getUpcomingPaymentData(proposal);

    return (
        <Card className="bg-background w-full">
            <div className="border-content/20 flex w-full justify-between border-b pb-5">
                <Title level="4" className="font-semibold">
                    {t('proposals.manageProposal.fundingProgress')}
                </Title>

                {proposal?.schedule?.milestones && (
                    <a
                        href={`${linksEnum.PROPOSAL_MILESTONE_MODULE}${proposal?.schedule?.project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary flex items-center justify-center gap-1 rounded-lg px-3 py-2"
                    >
                        <ProjectCatalystLogo className="text-white" />
                        <Paragraph className="text-white">
                            {t('proposals.manageProposal.milestoneModule')}
                        </Paragraph>
                    </a>
                )}
            </div>

            <div className="flex flex-col gap-3 py-5 text-center">
                <Title level="2">
                    {currency(
                        proposal?.amount_requested ?? 0,
                        2,
                        proposal?.currency,
                    )}
                </Title>
                <Paragraph className="text-content/60" size="lg">
                    {t('proposals.totalRequested')}
                </Paragraph>
            </div>

            <ProposalMetadataWidgetSection
                label={t('proposals.manageProposal.paid')}
                value={
                    proposal?.amount_received
                        ? currency(
                              proposal.amount_received,
                              2,
                              proposal.currency,
                          )
                        : '-'
                }
            />
            <ProposalMetadataWidgetSection
                label={t('campaigns.remaining')}
                value={
                    amountRemaining
                        ? currency(amountRemaining, 2, proposal.currency)
                        : '-'
                }
            />
            <ProposalMetadataWidgetSection
                label={t('charts.percentage')}
                value={`${percentageFunded.toFixed(2)}%`}
            />

            <ProposalMetadataWidgetSection
                label="Upcoming Payment"
                value={
                    ledger ? (
                        <>
                            <span className="font-semibold">
                                {currency(ledger.amount, 2, proposal.currency)}
                            </span>
                            <span className="ml-2 font-normal opacity-50">
                                ({ledger.date})
                            </span>
                        </>
                    ) : (
                        '-'
                    )
                }
            />

            <div className="border-content/20 border-t pt-4">
                <div className="bg-success/10 relative h-4 overflow-hidden rounded-full">
                    <div
                        className="bg-success absolute top-0 left-0 h-full transition-all duration-500"
                        style={{ width: `${Math.min(percentageFunded, 100)}%` }}
                    />
                </div>
            </div>
        </Card>
    );
}
