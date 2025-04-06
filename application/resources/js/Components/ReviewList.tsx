import Paginator from '@/Components/Paginator';
import React from 'react';
import Masonry from 'react-masonry-css';
import { PaginatedData } from '../../types/paginated-data';
import { ReviewCard } from './ReviewCard';
import ReviewData = App.DataTransferObjects.ReviewData;

export interface ReviewListProps {
    reviews: PaginatedData<ReviewData[]>;
    className?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
    reviews,
    className = '',
}) => {
    const breakpointColumnsObj = {
        default: 2,
        1100: 2,
        768: 1,
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="-ml-4 flex w-auto"
                columnClassName="pl-2"
            >
                {reviews?.data?.map((review) => (
                    <section key={review?.hash} className="mb-2">
                        <ReviewCard review={review} />
                    </section>
                ))}
            </Masonry>

            {/* Pagination */}
            <div className="mb-8 flex w-full items-center justify-center">
                {reviews.data && <Paginator pagination={reviews} />}
            </div>
        </div>
    );
};
