import {ReviewCard} from './ReviewCard';
import Paginator from '@/Components/Paginator';
import {PaginatedData} from '../../types/paginated-data';
import ReviewData = App.DataTransferObjects.ReviewData;
import Divider from "@/Components/Divider";
import React from "react";

export interface ReviewListProps {
    reviews: PaginatedData<ReviewData[]>;
    className?: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({
                                                          reviews,
                                                          className = '',
                                                      }) => {
    return (
        <div className={`space-y-6 ${className}`}>
            {reviews?.data?.map((review) => (
                <section key={review?.hash}>
                    <ReviewCard  review={review}/>

                    <div className="mt-6">
                        <Divider/>
                    </div>
                </section>
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
