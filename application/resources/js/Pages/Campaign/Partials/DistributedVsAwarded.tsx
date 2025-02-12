import PercentageProgressBar from '@/Components/PercentageProgressBar';
import { shortNumber } from '@/utils/shortNumber';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DistributedVsAwardedPageProps extends Record<string, unknown> {
    distributed: number;
    awarded: number;
    currency?: string;
}

const DistributedVsAwarded: React.FC<DistributedVsAwardedPageProps> = ({
    distributed,
    awarded,
    currency,
}) => {
    const { t } = useTranslation();

    const [currSymbol, setCurrSymbol] = useState<string>('');
    const [percentage, setPercentage] = useState<number>(0);

    useEffect(() => {
        currency == 'USD' ? setCurrSymbol('$') : setCurrSymbol('₳');
        const percentageValue = Math.trunc((distributed / awarded) * 100);
        setPercentage(percentageValue);
    }, [currency]);

    return (
        <div className="flex w-full flex-col gap-4">
            <PercentageProgressBar value={distributed} total={awarded} />
            <div className="flex items-center gap-2">
                <span className="text-content text-2xl font-bold">
                    {currSymbol}
                    {shortNumber(distributed)}
                </span>
                <span className="text-content text-2xl">
                    / {currSymbol}
                    {shortNumber(awarded)}({percentage ? percentage : 0}%)
                </span>
            </div>
            <div className="text-content text-2xl">
                {t('Distributed vs Awarded')}
            </div>
        </div>
    );
};

export default DistributedVsAwarded;
