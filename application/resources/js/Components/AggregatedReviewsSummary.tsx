import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Paragraph from './atoms/Paragraph';
import ProgressBar from './PercentageProgressBar';
import StarIcon from './svgs/StarIcon';
import ReviewData = App.DataTransferObjects.ReviewData;

interface RankingCount {
    [key: number]: number; // Mapping rating (1-5) to count
}

interface AggregatedReviewsSummaryPageProps extends Record<string, unknown> {
    reviews: ReviewData[];
    ratingStats?: RankingCount;
    reviewsCount?: number;
}

const AggregatedReviewsSummary: React.FC<AggregatedReviewsSummaryPageProps> = ({
    reviews,
    ratingStats,
    reviewsCount,
}) => {
    const { t } = useTranslation();

    const [counts, setCounts] = useState<RankingCount>({
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    });

    useEffect(() => {
        // Compute new counts using reduce
        const newCounts = reviews.reduce(
            (acc: RankingCount, review) => {
                if (
                    review?.ranking_total &&
                    review.ranking_total >= 1 &&
                    review.ranking_total <= 5
                ) {
                    acc[review.ranking_total] =
                        (acc[review.ranking_total] || 0) + 1;
                }
                return acc;
            },
            { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        );

        setCounts(newCounts);
    }, [reviews]); // Recalculate when `reviews` change

    return (
        <>
            <Head title={`${t('groups')}`} />

            <div className="bg-background-dark w-full">
                <div className="mx-auto grid grid-cols-5">
                    <div className="text-content flex flex-col items-center justify-center p-4">
                        <p className="text-content text-2xl font-bold">
                            {reviewsCount}
                        </p>

                        <Paragraph size="md" className="text-gray-persist mt-1">
                            {t('Total Reviews')}
                        </Paragraph>
                    </div>
                    <div className="col-span-4 flex items-center justify-center p-4 text-white">
                        <div className="flex w-full flex-col gap-4">
                            {Object.entries(ratingStats || {})
                                .sort(([a], [b]) => Number(b) - Number(a)) // Sort 5 → 1
                                .map(([rating, count]) => (
                                    <div
                                        key={rating}
                                        className="flex w-full items-center justify-center gap-4"
                                    >
                                        <div className="w-5/6">
                                            <ProgressBar
                                                primaryBackgroundColor="bg-light-gray-persist"
                                                secondaryBackgroudColor="bg-primary"
                                                value={count}
                                                total={reviews.length}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <StarIcon
                                                width={20}
                                                height={20}
                                                className="text-yellow-400"
                                            />
                                            <Paragraph
                                                size="lg"
                                                className="font-bold text-content"
                                            >
                                                {rating}
                                            </Paragraph>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AggregatedReviewsSummary;
