import { ReviewItem } from '@/Pages/IdeascaleProfile/Reviews/Index';
import { ReviewCard } from './ReviewItem';
import RecordsNotFound from '@/Layouts/RecordsNotFound';

export interface ReviewListProps {
    reviews: ReviewItem[];
    className?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    className = '',
}) => {
    
    return (
        <div className={`space-y-6 ${className}`}>
            {reviews.map((review) => (
                <ReviewCard key={review.review.hash} review={review} />
            ))}
        </div>
    );
};
