import React from 'react';
import Divider from './Divider';
import {ReviewerInfo} from './ReviewerInfo';
import {StarRating} from './ReviewsStar';
import Paragraph from './atoms/Paragraph';
import ReviewData = App.DataTransferObjects.ReviewData;

export interface ReviewItemProps {
    review: ReviewData;
    className?: string;
}

export const ReviewCard: React.FC<ReviewItemProps> = ({
  review,
  className = '',
}) => {
    return (
        <div className={`pb-6 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex">
                    <ReviewerInfo
                        review={review}
                    />
                </div>

                <StarRating rating={review.rating}/>
            </div>

            <Paragraph className="text-gray-persist mt-3 text-3">
                {review.content}
            </Paragraph>

            <div className="mt-6">
                <Divider/>
            </div>
        </div>
    );
};
