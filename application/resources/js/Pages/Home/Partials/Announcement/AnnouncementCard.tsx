import NavLink from '@/Components/NavLink';
import AnnouncementCardChip from './Chips/AnnouncementCardChip';
import AnnouncementCountdownChip from './Chips/AnnouncementCountdownChip';
import AnnouncementData = App.DataTransferObjects.AnnouncementData;

type LinkObj = Record<string, string>;

interface AnnouncementCardProps {
    announcement: AnnouncementData;
}

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
    const generateContentPreview = (content: string) => {
        const preview = content.substring(0, 70);
        return preview + (content.length > 100 ? '...' : '');
    };

    return (
        <div
            className="bg-background flex flex-col gap-3 rounded-xl px-3 py-4"
            data-testid={`announcement-card-${announcement.hash}`}
        >
            <div
                className="flex items-center justify-between"
                data-testid="announcement-card-header"
            >
                <AnnouncementCardChip label={announcement.label as any} />
                <AnnouncementCountdownChip
                    event_starts_at={announcement.event_starts_at!}
                    event_ends_at={announcement.event_ends_at!}
                />
            </div>
            <div
                className="text-content line-clamp-2 h-8 overflow-hidden text-base font-bold"
                data-testid="announcement-card-title"
            >
                {announcement.title}
            </div>
            <div
                className="text-gray-persist"
                data-testid="announcement-card-content"
            >
                {' '}
                {generateContentPreview(announcement.content)}
            </div>
            <div data-testid="announcement-card-footer">
                {
                    <div className="text-4 text-primary flex items-center gap-6 font-bold">
                        {Object.entries(announcement?.cta ?? {}).map((item) => {
                            const isExternal = item[1]?.startsWith('http');
                            if (isExternal) {
                                return (
                                    <a
                                        className="capitalize"
                                        href={item[1] || '#'}
                                        title={item[0]}
                                        target="_blank"
                                        data-testid={`announcement-card-link-${item[0]}`}
                                    >
                                        {item[0]}
                                    </a>
                                );
                            }
                            return (
                                <NavLink
                                    className="capitalize"
                                    href={item[1] || '#'}
                                    title={item[0]}
                                    data-testid={`announcement-card-link-${item[0]}`}
                                >
                                    {item[0]}
                                </NavLink>
                            );
                        })}
                    </div>
                }
            </div>
        </div>
    );
};

export default AnnouncementCard;
