import { Star } from 'lucide-react';

interface RatingProp {
  rating:number
}

const Rating = ({ rating = 3.5 }: RatingProp) => {
    const renderStars = () => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        return Array(5)
            .fill(0)
            .map((_, index) => {
                const isFullStar = index < fullStars;
                const isHalfStar =
                    !isFullStar && hasHalfStar && index === fullStars;

                return (
                    <div key={index} className="relative">
                        {/* Background star */}
                        <Star
                            size={14}
                            className="fill-gray-200 text-gray-200"
                        />

                        {/* Filled overlay */}
                        {(isFullStar || isHalfStar) && (
                            <div
                                className={`absolute inset-0 overflow-hidden ${
                                    isHalfStar ? 'w-1/2' : 'w-full'
                                }`}
                            >
                                <Star
                                    size={14}
                                    className="fill-yellow-400 text-yellow-400"
                                />
                            </div>
                        )}
                    </div>
                );
            });
    };

    return (
        <div className="mr-4 flex items-center">
            <div className="mr-2 flex items-center space-x-0.5">
                {renderStars()}
            </div>
            <span className="text-content mt-1 text-xl font-medium">
                {Number(rating).toFixed(1)}
            </span>
        </div>
    );
};

export default Rating;
