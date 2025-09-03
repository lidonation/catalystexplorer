import AnnouncementCard from './AnnouncementCard';
import AnnouncementData = App.DataTransferObjects.AnnouncementData;
interface AnnouncementCarouselProps {
    announcements: AnnouncementData[];
}
const AnnouncementCarousel = ({ announcements }: AnnouncementCarouselProps) => {
    return (
        <div
            className="scrollable flex gap-3 rounded-xl"
            data-testid="announcement-carousel"
        >
            {announcements &&
                announcements.length > 0 &&
                announcements.map((announcement, index) => {
                    return (
                        <div key={announcement?.id}>
                            <AnnouncementCard announcement={announcement} />
                        </div>
                    );
                })}
        </div>
    );
};

export default AnnouncementCarousel;
