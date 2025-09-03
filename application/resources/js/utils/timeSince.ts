export const getTimeSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    const timeUnits = [
        { unit: 'year', seconds: intervals.year },
        { unit: 'month', seconds: intervals.month },
        { unit: 'week', seconds: intervals.week },
        { unit: 'day', seconds: intervals.day },
        { unit: 'hour', seconds: intervals.hour },
        { unit: 'minute', seconds: intervals.minute },
    ];

    for (const { unit, seconds: unitSeconds } of timeUnits) {
        if (seconds >= unitSeconds) {
            const count = Math.floor(seconds / unitSeconds);
            return `${count} ${count === 1 ? unit : unit + 's'} ago`;
        }
    }

    return 'just now';
};
