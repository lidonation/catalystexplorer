export function formatTimeAgo(timestamp: string | Date | undefined): string {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const seconds = diffInSeconds;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return years === 1 ? '1 year ago' : `${years} years ago`;
    }
    if (months > 0) {
        return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    if (weeks > 0) {
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }
    if (days > 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
    }
    if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    if (minutes > 0) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }
    return 'Just now';
}
