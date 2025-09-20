import Paragraph from '@/Components/atoms/Paragraph';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/atoms/Tooltip';
import { useScreenDimension } from '@/useHooks/useScreenDimension';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';

interface AnnouncementCountdownChipProps {
    event_starts_at: string;
    event_ends_at: string;
}

const parseDate = (dateStr: string) => {
    // Handles "DD/MM/YYYY" format
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
        ).getTime();
    }
    // Handles ISO format
    return new Date(dateStr).getTime();
};

const formatTimeRemaining = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s`;
};

const AnnouncementCountdownChip = ({
    event_starts_at,
    event_ends_at,
}: AnnouncementCountdownChipProps) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const { isMobile } = useScreenDimension();
    const { t } = useLaravelReactI18n();

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const startTime = parseDate(event_starts_at);
            const endTime = parseDate(event_ends_at);

            if (now < startTime) {
                const diff = Math.floor((startTime - now) / 1000);
                setTimeRemaining(diff);
            } else if (now < endTime) {
                const diff = Math.floor((endTime - now) / 1000);
                setTimeRemaining(diff);
            } else {
                setTimeRemaining(0);
            }
        };

        if (!event_starts_at || !event_ends_at) {
            return;
        }
        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [event_starts_at, event_ends_at]);

    if (timeRemaining <= 0) {
        return null;
    }

    const remainingTime = formatTimeRemaining(timeRemaining);

    if (isMobile) {
        return (
            <TooltipProvider
                delayDuration={isMobile ? 0 : 150}
                disableHoverableContent={isMobile}
            >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="text-4 border-border-secondary text-content inline-flex items-center rounded-md border px-2 text-nowrap shadow-2xs"
                            role="status"
                            aria-label={`${t('announcements.timeRemaining')}: ${remainingTime}`}
                        >
                            {remainingTime}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <Paragraph size="sm">
                            {t('announcements.timeRemaining')}
                        </Paragraph>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="text-4 border-border-secondary text-content inline-flex items-center rounded-md border px-2 text-nowrap shadow-2xs">
            {formatTimeRemaining(timeRemaining) +
                ` ${t('announcements.remaining')}`}
        </div>
    );
};

export default AnnouncementCountdownChip;
