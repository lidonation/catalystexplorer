import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';
import { ParamsEnum } from '@/enums/proposal-search-params';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import RelatedReviews from '@/Pages/Reviews/Partials/RelatedReviews';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import CatalystProfileLayout from '../CatalystProfileLayout';
import CatalystProfileData = App.DataTransferObjects.CatalystProfileData;
import ReviewData = App.DataTransferObjects.ReviewData;

interface ReviewsPageProps {
    catalystProfile: CatalystProfileData;
    reviews: PaginatedData<ReviewData[]>;
    aggregatedRatings: { [s: string]: number } | ArrayLike<number>;
}

export default function Reviews({
    catalystProfile,
    reviews,
    aggregatedRatings,
}: ReviewsPageProps) {
    const { t } = useLaravelReactI18n();

    return (
        <CatalystProfileLayout catalystProfile={catalystProfile}>
            <Head title={`${catalystProfile.name} - ${t('reviews')}`} />
            <WhenVisible data="reviews" fallback={<div>Loading Reviews</div>}>
                <div className="container">
                    {reviews?.total > 0 ? (
                        <div className="space-y-8">
                            <div>
                                <AggregatedReviewsSummary
                                    reviews={reviews?.data}
                                    aggregatedRatings={aggregatedRatings}
                                    reviewsCount={reviews.total}
                                />
                            </div>
                            <RelatedReviews
                                reviews={reviews}
                                routeParam={{
                                    [ParamsEnum.IDEASCALE_PROFILES]:
                                        catalystProfile.id
                                            ? [catalystProfile.id]
                                            : null,
                                }}
                            />
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <RecordsNotFound />
                        </div>
                    )}
                </div>
            </WhenVisible>
        </CatalystProfileLayout>
    );
}
