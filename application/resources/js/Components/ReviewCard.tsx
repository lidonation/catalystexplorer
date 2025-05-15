import RichContent from '@/Components/RichContent';
import ValueLabel from '@/Components/atoms/ValueLabel';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import ExpandableContent from './ExpandableContent';
import ExpandableContentAnimation from './ExpandableContentAnimation';
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
    const [isHovered, setIsHovered] = useState(false);
    const { t } = useTranslation();
    const contentRef = useRef<HTMLParagraphElement | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [lineCount, setLineCount] = useState(0);
    const [baseHeight, setBaseHeight] = useState<number>(0);

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setLineCount(Math.round(height / lineHeight));
        }
    }, [review?.content]);

    useEffect(() => {
        if (cardRef.current && !baseHeight) {
            setBaseHeight(cardRef.current.scrollHeight);
        }
    }, [cardRef.current]);

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
                        only: ['reviews'],
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
                        only: ['reviews'],
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
        <>
            <ExpandableContentAnimation
                lineClamp={5}
                contentRef={contentRef}
                onHoverChange={setIsHovered}
                className={className}
            >
                <Card
                >
                    <div className={`pb-6 ${className}`}>
                        <div className="flex items-start justify-between">
                            <div className="flex">
                                <ReviewerInfo review={review} />
                            </div>

                            {review.rating && (
                                <StarRating
                                    rating={
                                        typeof review.rating == 'object'
                                            ? review?.rating.rating
                                            : review.rating
                                    }
                                />
                            )}
                        </div>

                        {review.content && (
                            <ExpandableContent
                                expanded={isHovered}
                                lineClamp={5}
                            >
                                <RichContent
                                    className={`text-gray-persist text-3 ${lineCount >= 5 ? 'cursor-pointer' : ''}`}
                                    content={review?.content}
                                    ref={contentRef}
                                />
                            </ExpandableContent>
                        )}

                        <div className="mt-8 flex items-center gap-6">
                            <Paragraph className="text-gray-persist text-sm">
                                {t('reviews.helpfulReview')}
                            </Paragraph>
                            <RankingButtons
                                isLoadingNegative={isLoadingNegative}
                                isLoadingPositive={isLoadingPositive}
                                positiveRankings={
                                    review?.positive_rankings ?? 0
                                }
                                negativeRankings={
                                    review?.negative_rankings ?? 0
                                }
                                markNegative={markNegative}
                                markPositive={markPositive}
                            />
                        </div>
                        <section className="mt-4 flex flex-wrap items-center gap-4">
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
                                        href={useLocalizedRoute(
                                            'funds.fund.show',
                                            {
                                                slug: review?.proposal?.fund
                                                    ?.slug,
                                            },
                                        )}
                                        className="link-primary text-sm"
                                    >
                                        {review?.proposal?.fund?.title}
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>
                </Card>
            </ExpandableContentAnimation>
        </>
    );
};
