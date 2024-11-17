import { currency } from '@/utils/currency';

interface Proposal extends Record<string, unknown> {
    proposal: App.DataTransferObjects.ProposalData;
}

export default function ProposalFundingPercentages({ proposal }: Proposal) {
    // Helper functions
    const calculatePercentage = (numerator: number, denominator: number) =>
        Math.ceil((numerator / denominator) * 100);

    const formatCurrency = (amount: number, currencyCode: string) =>
        currency(parseInt(amount.toString()), currencyCode);

    const getProgressBarColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-success';
        if (percentage >= 50) return 'bg-accent-secondary';
        return 'bg-primary';
    };

    // Calculations
    const amountRequested = formatCurrency(
        parseInt(proposal.amount_requested),
        proposal.currency,
    );

    const campaignBudget = formatCurrency(
        parseInt(proposal.campaign?.amount),
        proposal.campaign?.currency,
    );

    const campaignPercentage = calculatePercentage(
        parseInt(proposal.amount_requested),
        parseInt(proposal.campaign?.amount),
    );

    const fundingPercentage = calculatePercentage(
        parseInt(proposal.amount_received),
        parseInt(proposal.amount_requested),
    );

    const progressBarColor = getProgressBarColor(fundingPercentage);

    // Component Rendering
    return (
        <div className="mt-4">
            <div className="flex items-baseline justify-between gap-2">
                <span>Received</span>
                <div>
                    <span className="text-lg font-semibold">
                        {amountRequested}
                    </span>
                    <span className="text-sm text-highlight">{`/ ${campaignBudget} (${campaignPercentage}%)`}</span>
                </div>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-content-light">
                <div
                    className={`h-full rounded-full ${progressBarColor}`}
                    role="progressbar"
                    aria-valuenow={fundingPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: `${fundingPercentage}%` }}
                ></div>
            </div>
        </div>
    );
}
