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
        default: 2,
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
                            <div>
                                <Masonry
                                    breakpointCols={breakpointColumnsObj}
                                    className="-ml-4 flex w-auto"
                                    columnClassName="pl-2"
                                >
                                    {reviews?.data?.map((review) => (
                                        <section
                                            key={review?.hash}
                                            className="mb-2"
                                        >
                                            <ReviewCard review={review} />
                                        </section>
                                    ))}
                                    {!!reviews?.data &&
                                        reviews?.total > reviews?.per_page && (
                                            <div className="">
                                                <Link
                                                    href={useLocalizedRoute(
                                                        'reviews.index',
                                                        {
                                                            [ParamsEnum.GROUPS]:
                                                                [group.hash],
                                                        },
                                                    )}
                                                    className="bg-background flex min-h-54 flex-col items-center justify-center rounded-xl p-4 shadow-lg transition-transform hover:scale-95"
                                                >
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="text-center">
                                                            <Paragraph className="text-sm text-gray-600">
                                                                {t('seeAll')}
                                                            </Paragraph>
                                                            <Paragraph className="text-xl font-semibold">
                                                                {reviews.total}
                                                            </Paragraph>
                                                            <Paragraph className="text-sm text-gray-600">
                                                                {t(
                                                                    'reviews.reviews',
                                                                )}
                                                            </Paragraph>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )}
                                </Masonry>
                            </div>
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
