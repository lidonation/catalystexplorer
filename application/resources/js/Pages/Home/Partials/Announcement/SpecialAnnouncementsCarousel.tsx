import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/Components/Carousel';
import { useEffect } from 'react';
import SpecialAnnouncementCard from './SpecialAnnouncementsCard';
import AnnouncementData = App.DataTransferObjects.AnnouncementData;

interface AnnouncementCarouselProps {
    announcements: AnnouncementData[];
    activeIndex: number;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
    isTransitioning: boolean;
    setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>;
}

const SpecialAnnouncementCarousel = ({
    announcements,
    activeIndex,
    setActiveIndex,
    isTransitioning,
    setIsTransitioning,
}: AnnouncementCarouselProps) => {
    useEffect(() => {
        const interval = setInterval(handleNext, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleNext = () => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveIndex((prevIndex) =>
                    prevIndex === announcements.length - 1 ? 0 : prevIndex + 1,
                );
                setIsTransitioning(false);
            }, 500);
        }
    };

    const handleDotClick = (index: number) => {
        if (index !== activeIndex && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveIndex(index);
                setIsTransitioning(false);
            }, 500);
        }
    };

    return (
        <div className="relative w-full overflow-hidden border-b border-t">
            <Carousel role="region" aria-label="Announcement Carousel">
                <CarouselContent
                    className={`flex transition-transform duration-500 ${isTransitioning ? 'ease-in-out' : ''}`}
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    {announcements.map((announcement) => (
                        <CarouselItem
                            key={announcement.hash}
                            className="w-full shrink-0"
                        >
                            <SpecialAnnouncementCard
                                announcement={announcement}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>

            <div className="absolute bottom-4 left-1/2 mt-2 flex -translate-x-1/2 transform space-x-2">
                {announcements.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`h-3 w-3 rounded-full transition-all duration-300 sm:h-3 sm:w-3 ${
                            activeIndex === index
                                ? 'scale-100 bg-primary sm:scale-110'
                                : 'bg-gray-300'
                        }`}
                        aria-label={`Go to announcement ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default SpecialAnnouncementCarousel;
