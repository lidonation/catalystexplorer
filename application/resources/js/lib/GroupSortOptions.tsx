import {useLaravelReactI18n} from "laravel-react-i18n";


const GroupSortingOptions = () => {

    const { t } = useLaravelReactI18n();
    return [
        {
            label: t('groups.options.alphabetically'),
            value: 'name:asc',
        },
        {
            label: t('groups.options.amountAwardedAdaDesc'),
            value: 'amount_awarded_ada:desc',
        },
        {
            label: t('groups.options.amountAwardedAdaAsc'),
            value: 'amount_awarded_ada:asc',
        },
        {
            label: t('groups.options.amountAwardedUsdDesc'),
            value: 'amount_awarded_usd:desc',
        },
        {
            label: t('groups.options.amountAwardedUsdAsc'),
            value: 'amount_awarded_usd:asc',
        }
    ]
};

export default GroupSortingOptions;
