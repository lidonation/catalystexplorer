import Paragraph from "@/Components/atoms/Paragraph";
import Title from "@/Components/atoms/Title";
import Card from "@/Components/Card";
import { currency } from "@/utils/currency";
import ProposalMetadataWidgetSection from "./ProposalMetadataWidgetSection";
import { useLaravelReactI18n } from "laravel-react-i18n";

interface FundingProgressWidgetProps {
    proposal: App.DataTransferObjects.ProposalData;
}

export default function FundingProgressWidget({ proposal }: FundingProgressWidgetProps) {
    const { t } = useLaravelReactI18n();
    const amountRemaining = (proposal?.amount_requested ?? 0) - (proposal?.amount_received ?? 0);
    const percentageFunded = proposal?.amount_requested
        ? ((proposal.amount_received ?? 0) / proposal.amount_requested) * 100
        : 0;

    const currentMilestone = proposal?.schedule?.milestones?.find(m => m.current === true);


    const upcomingPayment = currentMilestone
        ? currentMilestone.cost - ((currentMilestone.cost * (currentMilestone.completion_percent ?? 0)) / 100)
        : 0;

    const upcomingPaymentDate = currentMilestone && proposal?.schedule?.starting_date
        ? (() => {
            const startDate = new Date(proposal.schedule.starting_date);
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(startDate.getMonth() + (currentMilestone.month ?? 0));
            return paymentDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        })()
        : null;

    return (
        <Card className="w-full bg-background">
            <Title level="4" className="font-semibold border-b pb-5 border-content/20">
                {t('proposals.manageProposal.fundingProgress')}
            </Title>
            <div className="text-center flex flex-col gap-3 py-5">
                <Title level="2">{currency(proposal?.amount_requested ?? 0, 2, proposal?.currency)}</Title>
                <Paragraph className="text-content/60" size="lg">
                    {t('proposals.totalRequested')}
                </Paragraph>
            </div>
            <ProposalMetadataWidgetSection
                label={t('proposals.manageProposal.paid')}
                value={proposal?.amount_received ? currency(proposal.amount_received, 2, proposal.currency) : '-'}
            />
            <ProposalMetadataWidgetSection
                label={t('campaigns.remaining')}
                value={amountRemaining ? currency(amountRemaining, 2, proposal.currency) : '-'}
            />
            <ProposalMetadataWidgetSection
                label={t('charts.percentage')}
                value={`${percentageFunded.toFixed(2)}%`}
            />
            <ProposalMetadataWidgetSection
                label="Upcoming Payment"
                value={
                    currentMilestone && upcomingPayment > 0
                        ? (
                            <>
                                {currency(upcomingPayment, 2, proposal.currency)}
                                {upcomingPaymentDate && (
                                    <span className="opacity-50"> ({upcomingPaymentDate})</span>
                                )}
                            </>
                        )
                        : '-'
                }
            />

            <div className="pt-4 border-t border-content/20">
                <div className="relative h-4 bg-success/10 rounded-full overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${Math.min(percentageFunded, 100)}%` }}
                    />
                </div>
            </div>
        </Card>
    )
}