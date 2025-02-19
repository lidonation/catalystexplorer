import {currencySymbol} from '@/utils/currencySymbol';
import {shortNumber} from '@/utils/shortNumber';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import PercentageProgressBar from './PercentageProgressBar';
import ValueLabel from "@/Components/atoms/ValueLabel";

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
    const {t} = useTranslation();

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

            <div className="flex flex-col px-0.5">
                <div className="flex items-center gap-2">
                    <span
                        className={`text-content font-bold ${smallSize ? 'text-lg' : 'text-xl'}`}
                    >
                        {currencySymbol(currency)}
                        {shortNumber(numerator, 2)}
                    </span>
                    <span
                        className={`text-content ${smallSize ? 'text-lg' : 'text-xl'}`}
                    >
                        / {currencySymbol(currency)}
                        {shortNumber(denominator, 2)} <ValueLabel className={`${smallSize ? 'text-lg' : 'text-xl'}`}>({percentage ? percentage : 0}%)</ValueLabel>
                    </span>
                </div>
                <div
                    className={`text-highlight ${smallSize ? 'text-md' : 'text-lg'}`}
                >
                    {t(title)}
                </div>
            </div>


        </div>
    );
};

export default AmountComparisonWithBar;
