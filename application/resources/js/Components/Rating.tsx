import clsx from 'clsx';
import { Star } from 'lucide-react';

interface RatingProp {
    rating: number;
    className?: string;
    filledClassName?: string;
    emptyClassName?: string;
    showValue?: boolean;
}

const Rating = ({
    rating = 3.5,
    className,
    filledClassName = 'fill-yellow-400 text-yellow-400',
    showValue = true,
}: RatingProp) => {
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
                                <Star size={14} className={filledClassName} />
                            </div>
                        )}
                    </div>
                );
            });
    };

    return (
        <div
            className={clsx(
                'flex items-center',
                showValue ? 'mr-4' : '',
                className,
            )}
        >
            <div
                className={clsx(
                    'flex items-center space-x-0.5',
                    showValue ? 'mr-2' : '',
                )}
            >
                {renderStars()}
            </div>
            {showValue && (
                <span className="text-content mt-1 text-xl font-medium">
                    {Number(rating).toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default Rating;
