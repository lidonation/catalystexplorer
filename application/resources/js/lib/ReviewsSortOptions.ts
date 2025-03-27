import { useTranslation } from "react-i18next";


const ReviewsSortOptions = () => {

    const { t } = useTranslation();
    return [
        {
            label: t('reviews.options.ratingAsc'),
            value: 'rating:asc',
        },
        {
            label: t('reviews.options.ratingDesc'),
            value: 'rating:desc',
        },
        {
            label: t('reviews.options.avgReputationScoreAsc'),
            value: 'reviewer.avg_reputation_score:asc',
        },
        {
            label: t('reviews.options.avgReputationScoreDesc'),
            value: 'reviewer.avg_reputation_score:desc',
        },
    ];
};

export default ReviewsSortOptions;