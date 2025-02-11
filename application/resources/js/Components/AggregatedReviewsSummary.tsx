import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from './PercentageProgressBar';
import StarIcon from './svgs/StarIcon';
import ReviewData = App.DataTransferObjects.ReviewData;

interface RankingCount {
    [key: number]: number; // Mapping rating (1-5) to count
}

interface AggregatedReviewsSummaryPageProps extends Record<string, unknown> {
    reviews: ReviewData[];
}

const AggregatedReviewsSummary: React.FC<AggregatedReviewsSummaryPageProps> = ({
    reviews,
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
            <Head title="Groups" />

            <div className="bg-background-dark w-full">
                <div className="mx-auto grid grid-cols-5">
                    <div className="text-content flex flex-col items-center justify-center p-4">
                        <h1 className="text-content title-1">
                            {reviews.length}
                        </h1>
                        <p className="text-content">{t('Total Reviews')}</p>
                    </div>
                    <div className="col-span-4 flex items-center justify-center p-4 text-white">
                        <div className="flex w-full flex-col gap-4">
                            {Object.entries(counts)
                                .sort(([a], [b]) => Number(b) - Number(a)) // Sort 5 → 1
                                .map(([rating, count]) => (
                                    <div
                                        key={rating}
                                        className="flex w-full items-center justify-center gap-4"
                                    >
                                        <div className="w-5/6">
                                            <ProgressBar
                                                value={count}
                                                total={reviews.length}
                                            />
                                        </div>
                                        <div className="text-content flex items-center justify-center gap-2">
                                            <StarIcon width={20} height={20} />
                                            {rating}
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
