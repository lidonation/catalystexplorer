import AggregatedReviewsSummary from '@/Components/AggregatedReviewsSummary';
import { ParamsEnum } from '@/enums/proposal-search-params';
import RecordsNotFound from '@/Layouts/RecordsNotFound';
import RelatedReviews from '@/Pages/Reviews/Partials/RelatedReviews';
import { Head, WhenVisible } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { PaginatedData } from '../../../types/paginated-data';
import ProposalLayout from '../ProposalLayout';
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewData = App.DataTransferObjects.ReviewData;

interface CommunityReviewIndexProps {
    proposal: ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    reviews: PaginatedData<ReviewData[]>;
    aggregatedRatings: { [s: string]: number } | ArrayLike<number>;
    ogMeta?: {
        ogImageUrl: string;
        proposalUrl: string;
        description: string;
    };
}

const Index = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    reviews,
    aggregatedRatings,
    ogMeta,
}: CommunityReviewIndexProps) => {
    const { t } = useLaravelReactI18n();

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
            ogMeta={ogMeta}
        >
            <Head title={`${proposal.title} - ${t('reviews')}`} />
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
                                    [ParamsEnum.PROPOSALS]: proposal.id
                                        ? [proposal.id]
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
        </ProposalLayout>
    );
};

export default Index;
