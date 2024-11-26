import AnnouncementCard from './AnnouncementCard';
import AnnouncementData = App.DataTransferObjects.AnnouncementData;
interface AnnouncementCarouselProps {
    announcements: AnnouncementData[];
}
const AnnouncementCarousel = ({ announcements }: AnnouncementCarouselProps) => {
    return (
        <div className="flex gap-3 rounded-xl scrollable">
            {announcements && announcements.length > 0 ? (
                announcements.map((announcement, index) => {
                    return (
                        <div key={index}>
                            <AnnouncementCard announcement={announcement} />
                        </div>
                    );
                })
            ) : (
                <div>No announcements</div>
            )}
        </div>
    );
};

export default AnnouncementCarousel;
