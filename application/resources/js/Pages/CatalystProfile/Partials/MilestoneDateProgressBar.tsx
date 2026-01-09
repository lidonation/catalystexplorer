import Paragraph from '@/Components/atoms/Paragraph';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useRef, useState } from 'react';

interface MilestoneDateProgressBarProps {
    startDate: string; // Format: "2022-11-11 17:37:43"
    months: number;
}

const MilestoneDateProgressBar: React.FC<MilestoneDateProgressBarProps> = ({
    startDate,
    months,
}) => {
    const { t } = useLaravelReactI18n();
    const startDateLabelRef = useRef<HTMLDivElement>(null);
    const endDateLabelRef = useRef<HTMLDivElement>(null);
    const nowDateLabelRef = useRef<HTMLDivElement>(null);
    const [labelsOverlap, setLabelsOverlap] = useState({
        startEnd: false,
        startNow: false,
        endNow: false,
    });

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
    const nowLabelColor = isWithinRange
        ? 'bg-success-light text-success border-success'
        : 'bg-error-light text-error border-error';

    const formatDate = (date: Date): string =>
        date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    // Check for label overlap using getBoundingClientRect
    const checkLabelOverlap = () => {
        if (
            startDateLabelRef.current &&
            endDateLabelRef.current &&
            nowDateLabelRef.current
        ) {
            const containerRect =
                startDateLabelRef.current.parentElement?.getBoundingClientRect();
            if (!containerRect) return;
            const startRect = startDateLabelRef.current.getBoundingClientRect();
            const nowRect = nowDateLabelRef.current.getBoundingClientRect();

            const endElement = endDateLabelRef.current;
            const endRect = endElement.getBoundingClientRect();

            const endRectOriginal = {
                left: endRect.left,
                right: endRect.right,
                top: containerRect.top,
                bottom: containerRect.top + endRect.height,
                width: endRect.width,
                height: endRect.height,
            } as DOMRect;

            // Helper function to check if two rectangles overlap
            const doRectsOverlap = (
                rect1: DOMRect,
                rect2: DOMRect,
            ): boolean => {
                return !(
                    rect1.right < rect2.left ||
                    rect2.right < rect1.left ||
                    rect1.bottom < rect2.top ||
                    rect2.bottom < rect1.top
                );
            };

            // Check all combinations using original position for end date
            const startEndOverlap = doRectsOverlap(startRect, endRectOriginal);
            const startNowOverlap = doRectsOverlap(startRect, nowRect);
            const endNowOverlap = doRectsOverlap(endRectOriginal, nowRect);

            setLabelsOverlap({
                startEnd: startEndOverlap,
                startNow: startNowOverlap,
                endNow: endNowOverlap,
            });
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(checkLabelOverlap, 0);

        window.addEventListener('resize', checkLabelOverlap);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', checkLabelOverlap);
        };
    }, [startDate, months, percentNow, endOffsetPercent, isWithinRange]);

    // Calculate positions and styles to avoid duplication
    const nowPosition = isWithinRange ? percentNow : 100;
    const endPosition = isWithinRange ? 100 : endOffsetPercent;
    const progressBarBg = isWithinRange ? 'bg-success-light' : 'bg-gray-200';
    const progressWidth = isWithinRange ? percentNow : 100;

    // Vertical line configurations
    const verticalLines = [
        { left: '0%', testId: 'milestone-start-line' },
        { left: `${nowPosition}%`, testId: 'milestone-now-line' },
        {
            left: `${endPosition}%`,
            testId: 'milestone-end-line',
        },
    ];

    return (
        <div
            style={{
                marginTop:
                    labelsOverlap.startEnd || labelsOverlap.endNow
                        ? '60px'
                        : '0px',
            }}
            data-testid="milestone-progress-bar-container"
            role="progressbar"
            aria-label={`Project milestone progress: ${Math.round(percentNow)}% complete`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percentNow)}
        >
            <div
                className="flex w-full flex-col gap-2 space-y-2"
                data-testid="milestone-progress-content"
            >
                {/* Labels Section */}
                <div
                    className="relative h-6 w-full text-sm font-medium"
                    data-testid="milestone-labels-section"
                >

                    {/* Start Date Label with Speech Bubble */}
                    <div
                        ref={startDateLabelRef}
                        className="absolute z-10 flex flex-col justify-items-center"
                        style={{
                            left: '8%',
                            transform: 'translateX(-50%)'
                        }}
                        data-testid="milestone-start-date-label"
                        aria-label={`Project start date: ${formatDate(start)}`}
                    >
                        <div className="relative">
                            {/* Main speech bubble - more pointed */}
                            <div className="bg-purple-light rounded-sm px-3 py-2 relative">
                                <Paragraph size="xs" className="flex gap-1 z-0">
                                    <span className="text-highlight">{t('startDate')}</span>
                                    <span className="text-dark font-bold">{formatDate(start)}</span>
                                </Paragraph>
                            </div>

                            {/* Speech bubble arrow pointing down-left - larger and sharper */}
                            <div className="absolute top-full left-0.5 z-2 -mt-0.5">
                                {/* Arrow shadow */}
                                <div className="absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-purple-light transform translate-y-px"></div>
                                {/* Arrow fill */}
                                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-purple-light"></div>
                            </div>
                        </div>
                    </div>


                    {/* Current Date Label */}
                    <div
                        ref={nowDateLabelRef}
                        className="absolute z-10"
                        style={{
                            left: `${nowPosition}%`,
                            top: '100%',
                            transform: 'translateX(-95%)',
                            whiteSpace: 'nowrap'
                        }}
                        data-testid="milestone-current-date-label"
                        aria-label={`Current date: ${formatDate(now)}`}
                    >
                        <Paragraph
                            size="xs"
                            className={`flex rounded-lg border border-1 px-1 py-1 text-xs whitespace-nowrap ${nowLabelColor}`}
                        >
                            {formatDate(now)}
                        </Paragraph>
                    </div>


                    {/* End Date Label with Speech Bubble */}
                    <div
                        ref={endDateLabelRef}
                        className="absolute z-10 flex flex-col justify-items-center"
                        style={{
                            left: `${endPosition}%`,
                            transform: 'translateX(-95%)',
                            whiteSpace: 'nowrap',
                            top:
                                labelsOverlap.startEnd || labelsOverlap.endNow
                                    ? '-20px'
                                    : '0px'
                        }}
                        data-testid="milestone-end-date-label"
                        aria-label={`Project end date: ${formatDate(end)}`}
                    >
                        <div className="relative">
                            {/* Main speech bubble - more pointed */}
                            <div className="bg-purple-light rounded-sm px-3 py-2 relative">
                                <Paragraph size="xs" className="flex gap-1 z-0">
                                    <span className="text-highlight">{t('endDate')}</span>
                                    <span className="text-dark font-bold">{formatDate(end)}</span>
                                </Paragraph>
                            </div>

                            {/* Speech bubble arrow pointing down-left - larger and sharper */}
                            <div className="absolute top-full right-0.5 z-2 -mt-0.5">
                                {/* Arrow shadow */}
                                <div className="absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-purple-light transform translate-y-px"></div>
                                {/* Arrow fill */}
                                <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-purple-light"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div
                    className={`${progressBarBg} relative h-3 w-full overflow-visible rounded-full`}
                    data-testid="milestone-progress-track"
                    aria-hidden="true"
                >
                <div className="relative h-full">
                        <div
                            className={`h-full ${barColor} rounded-full transition-all duration-500`}
                            style={{ width: `${progressWidth}%` }}
                            data-testid="milestone-progress-fill"
                        />

                        {/* Circular Now Marker */}
                        <div
                            className={`absolute h-6 w-6 rounded-full border-3 border-white ${barColor} shadow-md`}
                            style={{
                                left: `${nowPosition}%`,
                                top: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                            data-testid="milestone-current-marker"
                            aria-label="Current progress indicator"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MilestoneDateProgressBar;
