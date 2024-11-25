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

    return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s Remaining`;
};

const AnnouncementCountdownChip = ({
    event_starts_at,
    event_ends_at,
}: AnnouncementCountdownChipProps) => {
    const [timeRemaining, setTimeRemaining] = useState<number>(0);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const startTime = parseDate(event_starts_at)
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

    return (
        <div className="shadow-xs inline-flex items-center text-nowrap rounded-md border border-border-secondary text-content px-2 text-4">
            {formatTimeRemaining(timeRemaining)}
        </div>
    );
};

export default AnnouncementCountdownChip;
