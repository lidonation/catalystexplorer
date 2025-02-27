import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';
import { ReviewList } from '@/Components/ReviewList';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaginatedData } from '../../../../types/paginated-data';
import IdeascaleProfileLayout from '../IdeascaleProfileLayout';
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;
import UserData = App.DataTransferObjects.UserData;
import RecordsNotFound from '@/Layouts/RecordsNotFound';

export type ReviewItem = {
    review: ReviewData;
    user: UserData;
    userReviewsCount: number;
    rating: number;
    ideascaleProfile: IdeascaleProfileData;
};

interface RankingCount {
    [key: number]: number; // Mapping rating (1-5) to count
}

interface ReviewsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    reviews: PaginatedData<ReviewItem[]>;
    ratingStats: { [s: string]: number } | ArrayLike<number>;
}

export default function Reviews({
    ideascaleProfile,
    reviews,
    ratingStats,
}: ReviewsPageProps) {
    const { t } = useTranslation();

    const reviewsArray = reviews?.data?.map((item) => item.review) || [];

    useEffect(() => {
        console.log('Reviews:', JSON.stringify(reviews, null, 2));
        console.log('Rating Stats:', JSON.stringify(ratingStats, null, 2));
    }, [reviews, ratingStats]);

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile}>
            <Head title={`${ideascaleProfile.name} - Reviews`} />

            <div className="container">
                {reviews.total > 0 ? (
                    <div className="space-y-8">
                        <div>
                            <AggregatedReviewsSummary
                                reviews={reviewsArray}
                                ratingStats={ratingStats}
                                reviewsCount={reviews.total}
                            />
                        </div>
                        <div>
                            <ReviewList
                                reviews={reviews.data ?? []}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <RecordsNotFound/>
                    </div>
                )}
            </div>
        </IdeascaleProfileLayout>
    );
}