import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/Tooltip';
import { useScreenDimension } from '@/Hooks/useScreenDimension';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const {t} =useTranslation();

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
                <Tooltip >
                    <TooltipTrigger asChild>
                        <div
                            className="shadow-xs text-4 inline-flex items-center text-nowrap rounded-md border border-border-secondary px-2 text-content"
                            role="status"
                            aria-label={`${t('announcements.timeRemaining')}: ${remainingTime}`}
                        >
                            {remainingTime}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>
                            {t('announcements.timeRemaining')}
                        </p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="shadow-xs text-4 inline-flex items-center text-nowrap rounded-md border border-border-secondary px-2 text-content">
            {formatTimeRemaining(timeRemaining) + ` ${t('announcements.remaining')}`}
        </div>
    );
};

export default AnnouncementCountdownChip;
