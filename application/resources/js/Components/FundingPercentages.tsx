import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import PercentageProgressBar from './PercentageProgressBar';
import Paragraph from './atoms/Paragraph';

interface FundingPercentagesProps extends Record<string, unknown> {
    amount: number;
    total: number;
    amount_currency: string;
    primaryBackgroundColor: string;
    secondaryBackgroundColor: string;
}

export default function FundingPercentages({
    amount,
    total,
    amount_currency,
    primaryBackgroundColor,
    secondaryBackgroundColor,
}: FundingPercentagesProps) {
    const { t } = useTranslation();
    const calculatePercentage = (
        numerator: number,
        denominator: number,
    ): number =>
        denominator > 0 ? Math.ceil((numerator / denominator) * 100) : 0;

    return (
        <div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full">
                <PercentageProgressBar
                    value={amount ?? 0}
                    total={total ?? 0}
                    primaryBackgroundColor={primaryBackgroundColor}
                    secondaryBackgroudColor={secondaryBackgroundColor}
                />
            </div>
            <div className="mt-2 flex w-full justify-between">
                <div className="flex flex-wrap gap-1 items-center">
                    <Paragraph className="text-md font-semibold">
                        {currency(amount, 2, amount_currency)}
                    </Paragraph>
                    <Paragraph size="sm" className="text-highlight">
                        {` / ${currency(total ?? 0, 2, amount_currency)}`}
                    </Paragraph>
                    <Paragraph size="sm" className="text-highlight">
                        {` (${calculatePercentage(amount ?? 0, total ?? 0)}%)`}
                    </Paragraph>
                </div>
            </div>
        </div>
    );
}
