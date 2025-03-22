import { ReviewItem } from '@/Pages/IdeascaleProfile/Reviews/Index';
import { ReviewCard } from './ReviewItem';
import Paginator from '@/Components/Paginator';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { PaginatedData } from '../../types/paginated-data';

export interface ReviewListProps {
    reviews: PaginatedData<ReviewItem[]>;
    className?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    className = '',
}) => {
    
    return (
        <div className={`space-y-6 ${className}`}>
            {reviews?.data?.map((review) => (
                <ReviewCard key={review.review.hash} review={review} />
            ))}
            {/* Pagination */}
            <div className="mb-8 flex w-full items-center justify-center ">
                {reviews.data && (
                    <Paginator
                        pagination={reviews}
                    />
                )} 
            </div>
        </div>
    );
};
