import Paragraph from '@/Components/atoms/Paragraph';
import { ReviewCard } from '@/Components/ReviewCard';
import { PaginatedData } from '@/types/paginated-data';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React, { HTMLAttributes } from 'react';
import Masonry from 'react-masonry-css';

import ReviewData = App.DataTransferObjects.ReviewData;

interface RelatedReviewsProps extends HTMLAttributes<HTMLDivElement> {
    reviews: PaginatedData<ReviewData[]>;
    routeParam: { [x: string]: string[] | string | null };
    proposalWrapperClassName?: string;
}

const RelatedReviews: React.FC<RelatedReviewsProps> = ({
    reviews,
    routeParam,
    proposalWrapperClassName,
    ...props
}) => {
    const { t } = useLaravelReactI18n();

    const breakpointColumnsObj = {
        default: 1,
        1100: 2,
        768: 1,
    };

    return (
        <div>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="relative flex w-auto"
                columnClassName="pr-2"
            >
                {reviews?.data?.map((review, index) => (
                    <section
                        key={review?.id}
                        className="relative mb-2"
                        style={{
                            zIndex: reviews?.data?.length - index,
                        }}
                    >
                        <ReviewCard review={review} />
                    </section>
                ))}
                {!!reviews?.data && reviews?.total > reviews?.per_page && (
                    <div className="">
                        <Link
                            href={useLocalizedRoute(
                                'reviews.index',
                                routeParam,
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
                                        {t('reviews.reviews')}
                                    </Paragraph>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}
            </Masonry>
        </div>
    );
};

export default RelatedReviews;
