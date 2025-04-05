import { addMonths, differenceInMilliseconds, format, parse } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MilestoneDateProgressBarProps {
    startDate: string; // e.g., "2022-11-11 17:37:43"
    months: number;
}

const MilestoneDateProgressBar: React.FC<MilestoneDateProgressBarProps> = ({
    startDate,
    months,
}) => {
    const { t } = useTranslation();

    const parsedStartDate = parse(startDate, 'yyyy-MM-dd HH:mm:ss', new Date());
    const now = new Date();
    const endDate = addMonths(parsedStartDate, months);

    const totalDuration = differenceInMilliseconds(endDate, parsedStartDate);
    const progressDuration = differenceInMilliseconds(
        now < parsedStartDate ? parsedStartDate : now,
        parsedStartDate,
    );
    const percent = Math.min((progressDuration / totalDuration) * 100, 100);

    return (
        <div className="mx-auto w-full space-y-2">
            {/* Date labels */}
            <div className="flex justify-between px-1 text-xs">
                <span className="border-background-lighter flex flex-col justify-items-center gap-1 border px-2 py-1">
                    <span className="w-full text-center">
                        {t('Start Date')}
                    </span>
                    {format(parsedStartDate, 'MMMM d, yyyy')}
                </span>
                <span className="border-background-lighter flex flex-col justify-items-center gap-1 border px-2 py-1">
                    <span className="w-full text-center">{t('End Date')}</span>
                    <span>{format(endDate, 'MMMM d, yyyy')}</span>
                </span>
            </div>

            {/* Progress bar */}
            <div className="bg-background-lighter h-4 w-full overflow-hidden rounded-full">
                <div
                    className={`h-full ${now > endDate ? 'bg-error' : 'bg-success'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

export default MilestoneDateProgressBar;
