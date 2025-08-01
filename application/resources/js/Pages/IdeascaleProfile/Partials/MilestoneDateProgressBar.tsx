import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface MilestoneDateProgressBarProps {
    startDate: string; // Format: "2022-11-11 17:37:43"
    months: number;
}

const MilestoneDateProgressBar: React.FC<MilestoneDateProgressBarProps> = ({
    startDate,
    months,
}) => {
    const { t } = useLaravelReactI18n();

    const start = new Date(startDate.replace(' ', 'T'));
    const end = new Date(start);
    end.setMonth(start.getMonth() + months);
    const now = new Date();

    const totalRangeEnd = now > end ? now : end;
    const totalDuration = totalRangeEnd.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percentNow = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100),
    );

    const endOffsetPercent =
        ((end.getTime() - start.getTime()) / totalDuration) * 100;
    const isWithinRange = now <= end;
    const barColor = isWithinRange ? 'bg-success' : 'bg-error';

    const formatDate = (date: Date): string =>
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    return (
        <div>
            {isWithinRange ? (
                <div className="flex w-full flex-col gap-8 space-y-2">
                    {/* Labels */}
                    <div className="relative h-6 w-full text-sm font-medium">
                        <div className="border-background-lighter absolute left-0 flex flex-col justify-items-center rounded-lg border px-1 py-1">
                            <span className="text-gray-persist w-full text-center">
                                {t('Start Date')}
                            </span>
                            <span className="font-bold">
                                {formatDate(start)}
                            </span>
                        </div>

                        {/* Now Date Label */}
                        <div
                            className="absolute"
                            style={{
                                left: `${percentNow}%`,
                                top: `100%`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <div className="bg-success-light text-success border-success flex rounded-lg border border-1 px-1 py-1 text-xs whitespace-nowrap">
                                {formatDate(now)}
                            </div>
                        </div>

                        {/* End Date Label with clamp to avoid overflow */}
                        <div
                            className="border-background-lighter absolute flex flex-col justify-items-center rounded-lg border px-1 py-1"
                            style={{
                                left: `90%`,
                                transform: 'translateX(-50%)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span className="text-gray-persist w-full text-center">
                                {t('End Date')}
                            </span>
                            <span className="font-bold">{formatDate(end)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-success-light relative h-3 w-full overflow-visible rounded-full">
                        <div className="relative h-full">
                            <div
                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                style={{ width: `${percentNow}%` }}
                            ></div>

                            {/* Circular Now Marker */}
                            <div
                                className={`absolute h-6 w-6 rounded-full border-3 border-white ${barColor} shadow-md`}
                                style={{
                                    left: `${percentNow}%`,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex w-full flex-col gap-8 space-y-2">
                    {/* Labels */}
                    <div className="relative h-6 w-full text-sm font-medium">
                        {/* Start date label */}
                        <div className="border-background-lighter absolute left-0 flex flex-col justify-items-center rounded-lg border px-1 py-1">
                            <span className="text-gray-persist w-full text-center">
                                {t('Start Date')}
                            </span>
                            <span className="font-bold">
                                {formatDate(start)}
                            </span>
                        </div>

                        {/* Now Date Label with clamp to avoid overflow */}
                        <div
                            className="absolute"
                            style={{
                                left: `95%`,
                                top: `100%`,
                                transform: 'translateX(-50%)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <div className="bg-error-light text-error border-error flex rounded-lg border border-1 px-2 py-1 text-xs whitespace-nowrap">
                                {formatDate(now)}
                            </div>
                        </div>

                        {/* End Date Label */}
                        <div
                            className="border-background-lighter absolute flex flex-col justify-items-center rounded-lg border bg-white px-1 py-1"
                            style={{
                                left: `${endOffsetPercent}%`,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <span className="text-gray-persist w-full text-center">
                                {t('End Date')}
                            </span>
                            <span className="font-bold">{formatDate(end)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 w-full overflow-visible rounded-full bg-gray-200">
                        <div className="relative h-full">
                            <div
                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                style={{ width: `100%` }}
                            ></div>

                            {/* Circular Now Marker */}
                            <div
                                className={`absolute h-6 w-6 rounded-full border-3 border-white ${barColor} shadow-md`}
                                style={{
                                    left: `95%`,
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MilestoneDateProgressBar;
