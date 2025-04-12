import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';
import Paragraph from '@/Components/atoms/Paragraph';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import { Head, Link, WhenVisible } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { PaginatedData } from '../../../../types/paginated-data';
import ReviewData = App.DataTransferObjects.ReviewData;
import { ReviewCard } from '@/Components/ReviewCard';
import Card from '@/Components/Card';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { ParamsEnum } from '@/enums/proposal-search-params';

interface MyReviewsProps {
    reviews: PaginatedData<ReviewData[]>;
    aggregatedRatings: { [s: string]: number } | ArrayLike<number>;
    ideascaleProfileHashes: string[]
}

export default function MyReviews({
    reviews,
    aggregatedRatings,
    ideascaleProfileHashes
}: MyReviewsProps) {
    const { t } = useTranslation();
    const breakpointColumnsObj = {
        default: 2,
        1100: 2,
        768: 1,
    };
    return (
        <MyLayout>
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
                            <div>
                                <Masonry
                                    breakpointCols={breakpointColumnsObj}
                                    className="flex w-auto gap-2"
                                    columnClassName=""
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
                                                            [ParamsEnum.IDEASCALE_PROFILES]:
                                                                ideascaleProfileHashes,
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
        </MyLayout>
    );
}
