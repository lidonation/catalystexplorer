import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';
import Paragraph from '@/Components/atoms/Paragraph';
import { ReviewCard } from '@/Components/ReviewCard';
import { ParamsEnum } from '@/enums/proposal-search-params';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { PaginatedData } from '../../../../types/paginated-data';
import GroupLayout from '../GroupLayout';
import ReviewData = App.DataTransferObjects.ReviewData;
import GroupData = App.DataTransferObjects.GroupData;
import RelatedReviews from '@/Pages/Reviews/Partials/RelatedReviews';

interface ReviewPageProps {
    reviews: PaginatedData<ReviewData[]>;
    group: GroupData;
    aggregatedRatings: { [s: string]: number } | ArrayLike<number>;
}

export default function Reviews({
    reviews,
    group,
    aggregatedRatings,
}: ReviewPageProps) {
    const breakpointColumnsObj = {
        default: 1,
        1100: 2,
        768: 1,
    };

    const { t } = useTranslation();

    return (
        <GroupLayout group={group}>
            <Head title={`${group.name} - Connections`} />
            <WhenVisible data="reviews" fallback={<div>Loading Reviews</div>}>
                <div className="container">
                    {reviews?.data.length > 0 ? (
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
                                    [ParamsEnum.GROUPS]:
                                        group.hash
                                            ? [group.hash]
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
        </GroupLayout>
    );
}
