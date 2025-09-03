import { currency } from '@/utils/currency';
import { useLaravelReactI18n } from 'laravel-react-i18n';

interface Proposal extends Record<string, unknown> {
    proposal: App.DataTransferObjects.ProposalData;
}

export default function ProposalFundingDetails({ proposal }: Proposal) {
    const { t } = useLaravelReactI18n();
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
            2,
            currencyCode || 'USD',
        ) as string;

    const amountRequested = proposal.amount_requested
        ? proposal.amount_requested
        : 0;
    const amountReceived = proposal.amount_received
        ? proposal.amount_received
        : 0;

    const currencyCode = proposal.currency || 'USD';

    const formattedAmountRequested = formatCurrency(
        amountRequested,
        currencyCode,
    );
    const formattedAmountReceived = formatCurrency(
        amountReceived,
        currencyCode,
    );

    const fundingPercentage = calculatePercentage(
        amountReceived,
        amountRequested,
    );

    return (
        <div>
            <div className="border-gray-persist flex items-end justify-between gap-4 border-b pt-2 pb-2 text-sm">
                <div className="flex flex-col text-left">
                    <span className="text-gray-persist">
                        {t('groups.received')}
                    </span>
                    <span className="font-semibold">
                        {formattedAmountReceived}
                    </span>
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-gray-persist">
                        {t('groups.requested')}
                    </span>
                    <span className="font-semibold">
                        {formattedAmountRequested}
                    </span>
                </div>
                <div className="flex flex-col text-left">
                    <span className="text-gray-persist">
                        % {t('groups.received')}
                    </span>
                    <span className="font-semibold">{fundingPercentage}%</span>
                </div>
            </div>
        </div>
    );
}
