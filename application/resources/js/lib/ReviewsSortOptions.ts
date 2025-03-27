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
            value: 'avgReputation:asc',
        },
        {
            label: t('reviews.options.avgReputationScoreDesc'),
            value: 'avgReputation:desc',
        },
    ];
};

export default ReviewsSortOptions;