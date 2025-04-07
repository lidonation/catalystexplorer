import RichContent from '@/Components/RichContent';
import ValueLabel from '@/Components/atoms/ValueLabel';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { ReviewerInfo } from './ReviewerInfo';
import { StarRating } from './ReviewsStar';
import ReviewData = App.DataTransferObjects.ReviewData;
import { useTranslation } from 'react-i18next';
import Card from './Card';
import ExpandableContent from './ExpandableContent';
import Paragraph from './atoms/Paragraph';
import Button from './atoms/Button';
import ThumbsDownIcon from './svgs/ThumbsDownIcon';
import ThumbsUpIcon from './svgs/ThumbsUpIcon';

export interface ReviewItemProps {
    review: ReviewData;
    className?: string;
}

export const ReviewCard: React.FC<ReviewItemProps> = ({
    review,
    className = '',
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const markHelpful = () => {
        if (!review?.hash) return;

        // setIsLoading(true);

        router.post(
            generateLocalizedRoute('reviews.helpful', { review: review?.hash }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                onError: (errors) => {
                    console.error(errors);
                },
            },
        );
    };

    const markNotHelpful = () => {
        if (!review?.hash) return;

        // setIsLoading(true);

        router.post(
            generateLocalizedRoute('reviews.notHelpful', {
                id: review?.hash,
            }),
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                onError: (errors) => {
                    console.error(errors);
                },
            },
        );
        
    };

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
                    <ExpandableContent
                        className={
                            'mt-2 line-clamp-5'
                        }
                    >
                        <RichContent
                            className="text-gray-persist text-3"
                            content={review?.content}
                        />
                    </ExpandableContent>
                )}

                <div className="mt-8 flex items-center justify-between">
                    <Paragraph className="text-gray-persist text-sm">
                        {t('reviews.helpfulReview')}
                    </Paragraph>
                    <div className="flex gap-2">
                        <Button
                            className={`bg-success/30 border-success text-success flex items-center gap-1 rounded-md border p-2 ${
                                isLoading
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                            onClick={markHelpful}
                            disabled={isLoading}
                        >
                            <ThumbsUpIcon/>
                            <Paragraph className="font-bold">
                                {t('reviews.yes')}
                            </Paragraph>
                            {review?.helpful_total}
                        </Button>
                        <Button
                            className={`bg-error/30 border-error text-error flex items-center gap-1 rounded-md border p-2 ${
                                isLoading
                                    ? 'cursor-not-allowed'
                                    : 'cursor-pointer'
                            }`}
                            onClick={markNotHelpful}
                            disabled={isLoading}
                        >
                            <ThumbsDownIcon />
                            <Paragraph className="font-bold">
                                {t('reviews.no')}
                            </Paragraph>
                            {review?.not_helpful_total}
                        </Button>
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
