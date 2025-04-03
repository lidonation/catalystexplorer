import ValueLabel from '@/Components/atoms/ValueLabel';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { t } from 'i18next';
import React, { useEffect } from 'react';
import Card from './Card';
import ExpandableContent from './ExpandableContext';
import { ReviewerInfo } from './ReviewerInfo';
import { StarRating } from './ReviewsStar';
import Paragraph from './atoms/Paragraph';
import ThumbsDownIcon from './svgs/ThumbsDown';
import ThumbsUpIcon from './svgs/ThumbsUpIcon';
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
        <Card>
            <div className={`pb-6 ${className}`}>
                <div className="flex items-start justify-between">
                    <div className="flex">
                        <ReviewerInfo review={review} />
                    </div>

                    {review.rating && <StarRating rating={review.rating} />}
                </div>

                {review.content && (
                    <ExpandableContent content={review.content} />
                )}

                <div className="mt-8 flex justify-between items-center">
                    <Paragraph className="text-gray-persist">
                        Was this a helpful review?
                    </Paragraph>
                    <div className='flex gap-2'>
                        <div className="bg-success/30 border-success text-success flex items-center gap-1 rounded-md border p-2">
                            <ThumbsUpIcon />
                            <Paragraph className="font-bold">Yes</Paragraph>
                            {review?.helpful_total}
                        </div>
                        <div className="bg-error/30 border-error text-error flex items-center gap-1 rounded-md border p-2">
                            <ThumbsDownIcon />
                            <Paragraph className="font-bold">No</Paragraph>
                            {review?.not_helpful_total}
                        </div>
                    </div>
                </div>

                <section className="flex flex-wrap items-center gap-4">
                    {review?.proposal?.link && (
                        <div className="flex items-center gap-2">
                            <ValueLabel>{t('proposal')}</ValueLabel>
                            <Link
                                href={review?.proposal?.link}
                                className="link-primary text-sm"
                            >
                                {review?.proposal?.title}
                            </Link>
                        </div>
                    )}

                    {review?.proposal?.fund?.title && (
                        <div className="flex items-center gap-2">
                            <ValueLabel>{t('funds.fund')}</ValueLabel>
                            <Link
                                href={useLocalizedRoute('funds.fund.show', {
                                    slug: review?.proposal?.fund?.slug,
                                })}
                                className="link-primary text-sm"
                            >
                                {review?.proposal?.fund?.title}
                            </Link>
                        </div>
                    )}
                </section>
            </div>
        </Card>
    );
};
