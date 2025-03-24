import ReviewReputationScoreData = App.DataTransferObjects.ReviewerReputationScoreData;
import IdeascaleProfileData = App.DataTransferObjects.IdeascaleProfileData;

export type ReviewItem = {
    review: ReviewData;
    reviewerReviewsCount: number;
    rating: number;
    reviewerProfile: IdeascaleProfileData;
    reputationScores: ReviewReputationScoreData[];
};
