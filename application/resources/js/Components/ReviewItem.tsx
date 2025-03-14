import { ReviewItem } from '@/Pages/IdeascaleProfile/Reviews/Index';
import Divider from './Divider';
import { ReviewerInfo } from './ReviewerInfo';
import { StarRating } from './ReviewsStar';
import Paragraph from './atoms/Paragraph';

export interface ReviewItemProps {
    review: ReviewItem;
    className?: string;
}

export const ReviewCard: React.FC<ReviewItemProps> = ({
    review,
    className = '',
}) => {
    return (
        <div className={`pb-6 ${className}`}>
            <div className="flex items-center justify-between">
                <ReviewerInfo
                    ideascaleProfile={review.reviewerProfile}
                    reviewCount={review.reviewerReviewsCount}
                />
                <StarRating rating={review.rating} />
            </div>
            <Paragraph className="text-gray-persist mt-3 text-3">
              {review.review.content}
            </Paragraph>
            <div className="mt-6">
                <Divider />
            </div>
        </div>
    );
};
