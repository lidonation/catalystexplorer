import {useLaravelReactI18n} from "laravel-react-i18n";


const DrepSortingOptions = () => {

    const { t } = useLaravelReactI18n();
    return [
        {
            label: t('dreps.options.alphabetically'),
            value: 'name:asc',
        },
        {
            label: t('dreps.options.delegatorsDesc'),
            value: 'delegators:desc',
        },
        {
            label: t('dreps.options.delegatorsAsc'),
            value: 'delegators:asc',
        },
        {
            label: t('dreps.options.votersDesc'),
            value: 'voters:desc',
        },
        {
            label: t('dreps.options.votersAsc'),
            value: 'voters:asc',
        }
    ]
};

export default DrepSortingOptions;
