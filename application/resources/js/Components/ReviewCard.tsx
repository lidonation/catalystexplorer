import React from 'react';
import Divider from './Divider';
import {ReviewerInfo} from './ReviewerInfo';
import {StarRating} from './ReviewsStar';
import ReviewData = App.DataTransferObjects.ReviewData;
import RichContent from "@/Components/RichContent";
import ValueLabel from "@/Components/atoms/ValueLabel";
import {t} from "i18next";
import Value from "@/Components/atoms/Value";
import {useLocalizedRoute} from "@/utils/localizedRoute";
import {Link} from "@inertiajs/react";

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

                {review.rating && <StarRating rating={review.rating}/>}
            </div>


            {review.content && <RichContent
                className="text-content text-4 pb-2"
                content={review.content}
            />}

            <section className='flex flex-wrap gap-4 items-center '>
                {review?.proposal?.link && <div className='flex gap-2 items-center'>
                    <ValueLabel>
                        {t('proposal')}
                    </ValueLabel>
                    <Link href={review?.proposal?.link} className='link-primary text-sm'>
                        {review?.proposal?.title}
                    </Link>
                </div>}

                {review?.proposal?.fund?.title && <div className='flex gap-2 items-center'>
                    <ValueLabel>
                        {t('funds.fund')}
                    </ValueLabel>
                    <Link href={useLocalizedRoute('funds.fund.show', {slug: review?.proposal?.fund?.slug})}
                          className='link-primary text-sm'>
                        {review?.proposal?.fund?.title}
                    </Link>
                </div>}
            </section>

        </div>
    );
};
