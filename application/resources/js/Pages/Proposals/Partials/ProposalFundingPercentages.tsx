import { currency } from '@/utils/currency';

interface Proposal extends Record<string, unknown> {
    proposal: App.DataTransferObjects.ProposalData;
}

export default function ProposalFundingPercentages({ proposal }: Proposal) {
    // Helper functions
    const calculatePercentage = (
        numerator: number,
        denominator: number,
    ): number =>
        denominator > 0 ? Math.ceil((numerator / denominator) * 100) : 0;

    const formatCurrency = (
        amount: number | string | null | undefined,
        currencyCode?: string,
    ): string =>
        currency(
            amount ? parseInt(amount.toString()) : 0,
            currencyCode || 'USD',
        ) as string;

    const getProgressBarColor = (percentage: number): string => {
        if (percentage >= 80) return 'bg-success';
        if (percentage >= 50) return 'bg-accent-secondary';
        return 'bg-primary';
    };

    // Extract proposal data safely
    const amountRequested = proposal.amount_requested
        ? proposal.amount_requested
        : 0;
    const amountReceived = proposal.amount_received
        ? proposal.amount_received
        : 0;
    const campaignAmount = proposal.campaign?.amount
        ? proposal.campaign.amount
        : 0;
    const currencyCode = proposal.currency || 'USD';
    const campaignCurrency = proposal.campaign?.currency || 'USD';

    // Calculations
    const formattedAmountRequested = formatCurrency(
        amountRequested,
        currencyCode,
    );
    const formattedCampaignBudget = formatCurrency(
        campaignAmount,
        campaignCurrency,
    );

    const campaignPercentage = calculatePercentage(
        amountRequested,
        campaignAmount,
    );
    const fundingPercentage = calculatePercentage(
        amountReceived,
        amountRequested,
    );

    const progressBarColor = getProgressBarColor(fundingPercentage);

    // Component Rendering
    return (
        <div>
            <div className="flex items-baseline justify-between gap-2">
                <span>Received</span>
                <div>
                    <span className="text-lg font-semibold">
                        {formattedAmountRequested}
                    </span>
                    <span className="text-highlight text-sm">{`/ ${formattedCampaignBudget} (${campaignPercentage}%)`}</span>
                </div>
            </div>
            <div className="bg-content-light mt-2 h-3 w-full overflow-hidden rounded-full">
                <div
                    className={`h-full rounded-full ${progressBarColor}`}
                    role="progressbar"
                    aria-label="funds recieved"
                    aria-valuenow={fundingPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    style={{ width: `${fundingPercentage}%` }}
                ></div>
            </div>
        </div>
    );
}
