import ValueLabel from './atoms/ValueLabel';
import StarIcon from './svgs/StarIcon';

export interface StarRatingProps {
    rating: number | null;
    showValue?: boolean;
    className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    showValue = true,
    className = '',
}) => {
    return (
        <div className={`flex items-center ${className}`}>
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        width={16}
                        height={16}
                        className={`${star <= (rating ?? 0) ? 'text-yellow-400' : 'text-light-gray-persist'}`}
                    />
                ))}{' '}
            </div>
            {showValue && (
                <ValueLabel className="text-content ms-4 text-lg font-bold">
                    {rating}
                </ValueLabel>
            )}
        </div>
    );
};
