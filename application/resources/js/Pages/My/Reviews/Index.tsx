import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';
import Card from '@/Components/Card';
import { ParamsEnum } from '@/enums/proposal-search-params';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import RelatedReviews from '@/Pages/Reviews/Partials/RelatedReviews';
import { PaginatedData } from '@/types/paginated-data';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import ReviewData = App.DataTransferObjects.ReviewData;

interface MyReviewsProps {
    reviews: PaginatedData<ReviewData[]>;
    aggregatedRatings: { [s: string]: number } | ArrayLike<number>;
    ideascaleProfileHashes: string[];
}

export default function MyReviews({
    reviews,
    aggregatedRatings,
    ideascaleProfileHashes,
}: MyReviewsProps) {
    const { t } = useLaravelReactI18n();
    const breakpointColumnsObj = {
        default: 1,
        1100: 2,
        768: 1,
    };
    return (
        <>
            <Head title="My Reviews" />
            <WhenVisible data="reviews" fallback={<div>Loading Reviews</div>}>
                <div className="container">
                    {reviews?.data.length > 0 ? (
                        <div className="container space-y-8">
                            <Card className="">
                                <AggregatedReviewsSummary
                                    reviews={reviews?.data}
                                    aggregatedRatings={aggregatedRatings}
                                    reviewsCount={reviews.total}
                                />
                            </Card>
                            <RelatedReviews
                                reviews={reviews}
                                routeParam={{
                                    [ParamsEnum.IDEASCALE_PROFILES]:
                                        ideascaleProfileHashes,
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
        </>
    );
}
