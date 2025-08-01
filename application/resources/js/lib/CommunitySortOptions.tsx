import {useLaravelReactI18n} from "laravel-react-i18n";

const CommunitySortingOptions = () => {
    const { t } = useLaravelReactI18n();
    return [
        {
            label: t('communities.options.alphabetically'),
            value: 'title:asc',
        },
        {
            label: t('communities.options.amountAwardedAdaDesc'),
            value: 'amount_awarded_ada:desc',
        },
        {
            label: t('communities.options.amountAwardedAdaAsc'),
            value: 'amount_awarded_ada:asc',
        },
        {
            label: t('communities.options.amountAwardedUsdDesc'),
            value: 'amount_awarded_usd:desc',
        },
        {
            label: t('communities.options.amountAwardedUsdAsc'),
            value: 'amount_awarded_usd:asc',
        },
    ];
};

export default CommunitySortingOptions;
