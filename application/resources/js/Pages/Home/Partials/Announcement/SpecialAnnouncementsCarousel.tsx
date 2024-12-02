import SpecialAnnouncementCard from "./SpecialAnnouncementsCard";
import AnnouncementData = App.DataTransferObjects.AnnouncementData;
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

interface AnnouncementCarouselProps {
    announcements: AnnouncementData[];
}

const SpecialAnnouncementCarousel = ({ announcements }: AnnouncementCarouselProps) => {
    const responsive = {
        allDevices: {
            breakpoint: { max: 3000, min: 0 },
            items: 1,
            slidesToSlide: 1,
        },
    };

    return (
        <div className="w-full border-b border-t">
            <Carousel
                responsive={responsive}
                infinite={true}
                autoPlay={true}
                autoPlaySpeed={5000}
                transitionDuration={500}
                arrows={false}
            >
                {announcements && announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div key={announcement.id}>
                            <SpecialAnnouncementCard announcement={announcement} />
                        </div>
                    ))
                ) : (
                    <div>No announcements</div>
                )}
            </Carousel>
        </div>
    );
};

export default SpecialAnnouncementCarousel;
