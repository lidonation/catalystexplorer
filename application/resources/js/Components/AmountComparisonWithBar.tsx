import { currencySymbol } from '@/utils/currencySymbol';
import { shortNumber } from '@/utils/shortNumber';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PercentageProgressBar from './PercentageProgressBar';

interface AmountComparisonWithBarPageProps extends Record<string, unknown> {
    title: string;
    numerator: number;
    denominator: number;
    currency: string;
    smallSize?: boolean;
    onWhiteBackground?: boolean;
}

const AmountComparisonWithBar: React.FC<AmountComparisonWithBarPageProps> = ({
    title,
    numerator,
    denominator,
    currency = 'USD',
    smallSize = false,
    onWhiteBackground = false,
}) => {
    const { t } = useTranslation();

    const [percentage, setPercentage] = useState<number>(0);

    useEffect(() => {
        const percentageValue = Math.trunc((numerator / denominator) * 100);
        setPercentage(percentageValue);
    }, [currency]);

    return (
        <div
            className={`flex w-full flex-col gap-2 ${smallSize ? 'gap-2' : 'gap-4'}`}
        >
            <PercentageProgressBar
                value={numerator}
                total={denominator}
                primaryBackgroundColor={'bg-content-light'}
                secondaryBackgroudColor={'bg-primary'}
            />
            <div className="flex items-center gap-2">
                <span
                    className={`text-content font-bold ${smallSize ? 'text-lg' : 'text-2xl'}`}
                >
                    {currencySymbol(currency)}
                    {shortNumber(numerator)}
                </span>
                <span
                    className={`text-content ${smallSize ? 'text-lg' : 'text-2xl'}`}
                >
                    / {currencySymbol(currency)}
                    {shortNumber(denominator)}({percentage ? percentage : 0}%)
                </span>
            </div>
            <div
                className={`text-content ${smallSize ? 'text-lg' : 'text-2xl'}`}
            >
                {t(title)}
            </div>
        </div>
    );
};

export default AmountComparisonWithBar;
