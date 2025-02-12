import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import PercentageProgressBar from '../../../Components/PercentageProgressBar';

interface GroupFundingPercentagesProps extends Record<string, unknown> {
    amount: number;
    total: number;
    amount_currency: string;
    primaryBackgroundColor: string;
    secondaryBackgroundColor: string;
}

export default function GroupFundingPercentages({
    amount,
    total,
    amount_currency,
    primaryBackgroundColor,
    secondaryBackgroundColor,
}: GroupFundingPercentagesProps) {
    const { t } = useTranslation();
    const calculatePercentage = (
        numerator: number,
        denominator: number,
    ): number =>
        denominator > 0 ? Math.ceil((numerator / denominator) * 100) : 0;

    return (
        <div>
            <div>
                <div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full">
                        <PercentageProgressBar
                            value={amount ?? 0}
                            total={total ?? 0}
                            primaryBackgroundColor={primaryBackgroundColor}
                            secondaryBackgroudColor={secondaryBackgroundColor}
                        />
                    </div>
                    <div>
                        <span className="text-lg font-semibold">
                            {currency(amount, amount_currency, undefined, 2)}
                        </span>
                        <span className="text-highlight text-sm">{`/ ${currency(total ?? 0, amount_currency, undefined, 2)}`}</span> <br/>
                        <span>{`(${calculatePercentage(amount ?? 0, total ?? 0)}%)`}</span>
                    </div>
                </div>

                {/* <div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full">
                        <PercentageProgressBar
                            value={amount_usd ?? 0}
                            total={total_usd ?? 0}
                            primaryBackgroundColor={'bg-content-light'}
                            secondaryBackgroudColor={'bg-primary'}
                        />
                    </div>
                    <div className="mt-2 flex justify-between">
                        <div>
                            <div>
                                <span className="text-lg font-semibold">
                                    {currency(
                                        amount_usd ?? 0,
                                        'USD',
                                        undefined,
                                        2,
                                    )}
                                </span>
                                <span className="text-highlight text-sm">{`/ ${currency(total_usd ?? 0, 'USD', undefined, 2)} (${calculatePercentage(amount_usd ?? 0, total_usd ?? 0)}%)`}</span>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}
