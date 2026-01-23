import RichContent from '@/Components/RichContent';
import ValueLabel from '@/Components/atoms/ValueLabel';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { useEffect, useRef, useState } from 'react';
import Card from './Card';
import ExpandableContent from './ExpandableContent';
import ExpandableContentAnimation from './ExpandableContentAnimation';
import RankingButtons from './RankingButtons';
import ReviewComments from './ReviewComments';
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
    const { t } = useLaravelReactI18n();
    const contentRef = useRef<HTMLParagraphElement | null>(null);
    const [lineCount, setLineCount] = useState(0);

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            setLineCount(Math.round(height / lineHeight));
        }
    }, [review?.content]);

    const markPositive = () => {
        if (!review?.id) return;
        setIsLoadingPositive(true);
        router.post(
            generateLocalizedRoute('reviews.helpful', { review: review?.id }),
            {},
            {
                preserveScroll: true,
                onFinish: () => {
                    router.reload({
                        only: [
                            'reviews',
                            'proposals',
                            'groups',
                            'ideascaleProfiles',
                        ],
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
        if (!review?.id) return;
        router.post(
            generateLocalizedRoute('reviews.notHelpful', {
                id: review?.id,
            }),
            {},
            {
                onStart: () => {
                    setIsLoadingNegative(true);
                },
                preserveScroll: true,
                onFinish: () => {
                    router.reload({
                        only: [
                            'reviews',
                            'proposals',
                            'groups',
                            'ideascaleProfiles',
                        ],
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
                <Card className="bg-background">
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

                        <section>
                            <ReviewComments
                                reviewId={review.id}
                                team={review?.proposal?.team}
                            />
                        </section>
                    </div>
                </Card>
            </ExpandableContentAnimation>
        </>
    );
};
