import RichContent from '@/Components/RichContent';
import ValueLabel from '@/Components/atoms/ValueLabel';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import ExpandableContent from './ExpandableContent';
import RankingButtons from './RankingButtons';
import { ReviewerInfo } from './ReviewerInfo';
import { StarRating } from './ReviewsStar';
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
    const [isLoadingPositive, setIsLoadingPositive] = useState(false);
    const [isLoadingNegative, setIsLoadingNegative] = useState(false);

    const { t } = useTranslation();

    const markPositive = () => {
        if (!review?.hash) return;

        setIsLoadingPositive(true);

        router.post(
            generateLocalizedRoute('reviews.helpful', { review: review?.hash }),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    router.reload({
                        only: ['review'],
                        onFinish: () => setIsLoadingPositive(false),
                    });
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsLoadingPositive(false);
                },
            },
        );
    };

    const markNegative = () => {
        if (!review?.hash) return;

        router.post(
            generateLocalizedRoute('reviews.notHelpful', {
                id: review?.hash,
            }),
            {},
            {
                onStart: () => {
                    setIsLoadingNegative(true);
                },
                preserveScroll: true,
                onFinish: () => {
                    router.reload({
                        only: ['review'],
                        onFinish: () => setIsLoadingNegative(false),
                    });
                },
                onError: (errors) => {
                    console.error(errors);
                    setIsLoadingNegative(false);
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
                    <ExpandableContent className={'line-clamp-5'}>
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
                    <RankingButtons
                        isLoadingNegative={isLoadingNegative}
                        isLoadingPositive={isLoadingPositive}
                        positiveRankings={review?.positive_rankings ?? 0}
                        negativeRankings={review?.negative_rankings ?? 0}
                        markNegative={markNegative}
                        markPositive={markPositive}
                    />
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
