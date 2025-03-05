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
import { SearchParams } from '../../../../types/search-params';

export type ReviewItem = {
    review: ReviewData;
    reviewerReviewsCount: number;
    rating: number;
    reviewerProfile: IdeascaleProfileData;
};

interface RankingCount {
    [key: number]: number; // Mapping rating (1-5) to count
}

interface ReviewsPageProps {
    ideascaleProfile: IdeascaleProfileData;
    reviews: PaginatedData<ReviewItem[]>;
    ratingStats: { [s: string]: number } | ArrayLike<number>;
    filters: SearchParams;
}

export default function Reviews({
    ideascaleProfile,
    reviews,
    ratingStats,
    filters
}: ReviewsPageProps) {
    const { t } = useTranslation();

    const reviewsArray = reviews?.data?.map((item) => item.review) || [];

    return (
        <IdeascaleProfileLayout ideascaleProfile={ideascaleProfile} filters={filters}>
            <Head title={`${ideascaleProfile.name} - ${t('reviews')}`} />

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
                                reviews={reviews?? []}
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