import { currency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import PercentageProgressBar from '../../../Components/PercentageProgressBar';

interface GroupFundingPercentagesProps extends Record<string, unknown> {
    amount: number;
    total: number;
    isMini: boolean;
    twoColumns: boolean;
    amount_currency: string;
    primaryBackgroundColor: string;
    secondaryBackgroundColor: string;
}

export default function GroupFundingPercentages({
    amount,
    total,
    amount_currency,
    isMini,
    twoColumns,
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
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full">
                <PercentageProgressBar
                    value={amount ?? 0}
                    total={total ?? 0}
                    primaryBackgroundColor={primaryBackgroundColor}
                    secondaryBackgroudColor={secondaryBackgroundColor}
                />
            </div>
            <div
                className='mt-2 w-full flex justify-between'
            >
                {isMini && !twoColumns && (
                    <p className="text-gray-persist mt-1">{t('groups.received')}</p>
                )}

                <div className='mt-1'>
                    <span className="text-md font-semibold">
                        {currency(amount, amount_currency, undefined, 2)}
                    </span>
                    <span className="text-highlight text-sm">{` / ${currency(total ?? 0, amount_currency, undefined, 2)}`}</span>
                    {
                        twoColumns && (
                            <br/>
                        )
                    }
                    <span className="text-highlight text-sm">{` (${calculatePercentage(amount ?? 0, total ?? 0)}%)`}</span>
                </div>
            </div>
        </div>
    );
}
