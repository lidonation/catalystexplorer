import Paginator from '@/Components/Paginator';
import React from 'react';
import Masonry from 'react-masonry-css';
import { PaginatedData } from '../types/paginated-data';
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
        <div className={` ${className}`}>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="relative flex w-auto"
                columnClassName="pr-2"
            >
                {reviews?.data?.map((review, index) => (
                    <section
                        key={review?.hash}
                        className="relative mb-2"
                        style={{ zIndex: reviews?.data?.length - index }}
                    >
                        <ReviewCard review={review} />
                    </section>
                ))}
            </Masonry>

            <div className="mb-8 w-full">
                {reviews?.data && <Paginator pagination={reviews} />}
            </div>
        </div>
    );
};
