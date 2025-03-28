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
        {
            label: t('reviews.options.helpful'),
            value: 'helpful_total:asc',
        },
        {
            label: t('reviews.options.notHelpful'),
            value: 'not_helpful_total:desc',
        },
    ];
};

export default ReviewsSortOptions;