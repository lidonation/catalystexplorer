import { useTranslation } from "react-i18next";
import ProposalLayout from "../ProposalLayout";
import AggregatedReviewsSummary from "@/Components/AggregatedReviewsSummary";
import ProposalData = App.DataTransferObjects.ProposalData;
import ReviewData = App.DataTransferObjects.ReviewData;
import { Head, WhenVisible } from "@inertiajs/react";
import { PaginatedData } from "../../../../types/paginated-data";
import RelatedReviews from "@/Pages/Reviews/Partials/RelatedReviews";
import { ParamsEnum } from "@/enums/proposal-search-params";
import RecordsNotFound from "@/Layouts/RecordsNotFound";

interface CommunityReviewIndexProps {
    proposal: ProposalData;
    globalQuickPitchView: boolean;
    setGlobalQuickPitchView?: (value: boolean) => void;
    reviews: PaginatedData<ReviewData[]>;
    aggregatedRatings: { [s: string]: number } | ArrayLike<number>;
}

const Index = ({
    proposal,
    globalQuickPitchView,
    setGlobalQuickPitchView,
    reviews,
    aggregatedRatings,
}: CommunityReviewIndexProps) => {
    const { t } = useTranslation();

    return (
        <ProposalLayout
            proposal={proposal}
            globalQuickPitchView={globalQuickPitchView}
            setGlobalQuickPitchView={setGlobalQuickPitchView}
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
                                    [ParamsEnum.PROPOSALS]:
                                        proposal.hash
                                            ? [proposal.hash]
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
