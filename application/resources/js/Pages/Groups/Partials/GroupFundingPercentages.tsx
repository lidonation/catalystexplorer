import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import PercentageProgressBar from '../../../Components/PercentageProgressBar';

interface GroupFundingPercentagesProps extends Record<string, unknown> {
    amount_ada: number;
    amount_usd: number;
    total_ada: number;
    total_usd: number;
}

export default function GroupFundingPercentages({
    amount_ada,
    amount_usd,
    total_ada,
    total_usd,
}: GroupFundingPercentagesProps) {
    const { t } = useTranslation();
    const calculatePercentage = (
        numerator: number,
        denominator: number,
    ): number =>
        denominator > 0 ? Math.ceil((numerator / denominator) * 100) : 0;

    return (
        <div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full">
                        <PercentageProgressBar
                            value={amount_ada ?? 0}
                            total={total_ada ?? 0}
                            primaryBackgroundColor={'bg-content-light'}
                            secondaryBackgroudColor={'bg-eye-logo'}
                        />
                    </div>
                    <div className="mt-2 flex justify-between">
                        <div>
                            <div>
                                <span className="text-lg font-semibold">
                                    {currency(
                                        amount_ada ?? 0,
                                        'ADA',
                                        undefined,
                                        2,
                                    )}
                                </span>
                                <span className="text-highlight text-sm">{`/ ${currency(total_ada ?? 0, 'ADA', undefined, 2)} (${calculatePercentage(amount_ada ?? 0, total_ada ?? 0)}%)`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
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
                </div>
            </div>
        </div>
    );
}
