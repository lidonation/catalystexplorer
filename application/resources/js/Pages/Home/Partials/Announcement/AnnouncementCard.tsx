import NavLink from '@/Components/NavLink';
import AnnouncementCardChip from './Chips/AnnouncementCardChip';
import AnnouncementCountdownChip from './Chips/AnnouncementCountdownChip';
import AnnouncementData = App.DataTransferObjects.AnnouncementData;

type LinkObj = {
    label: string;
    link: string;
    title: string;
};

interface AnnouncementCardProps {
    announcement: AnnouncementData;
}

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
    const generateContentPreview = (content: string) => {
        const preview = content.substring(0, 70);
        return preview + (content.length > 100 ? '...' : '');
    };

    const navigateTo = (linkObj: LinkObj) => {
        const isExternal = linkObj.link?.startsWith('http');
        if (isExternal) {
            return (
                <a
                    className="capitalize"
                    href={linkObj.link || '#'}
                    title={linkObj.title}
                    target="_blank"
                >
                    {linkObj.label}
                </a>
            );
        }
        return (
            <NavLink
                className="capitalize"
                href={linkObj.link || '#'}
                title={linkObj.title}
            >
                {linkObj.label}
            </NavLink>
        );
    };

    return (
        <div className="flex flex-col gap-3 rounded-xl bg-background px-3 py-4">
            <div className="flex items-center justify-between">
                <AnnouncementCardChip label={announcement.label as any} />
                <AnnouncementCountdownChip
                    event_starts_at={announcement.event_starts_at!}
                    event_ends_at={announcement.event_ends_at!}
                />
            </div>
            <div className="line-clamp-2 h-8 overflow-hidden text-base font-bold text-content">
                {announcement.title}
            </div>
            <div className="text-gray-persist">
                {' '}
                {generateContentPreview(announcement.content)}
            </div>
            <div>
                {(
                    <div className="text-4 font-bold text-primary">
                        {navigateTo(announcement.cta as LinkObj)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementCard;
