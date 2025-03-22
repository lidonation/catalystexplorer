import { useTranslation } from "react-i18next";


const DrepSortingOptions = () => {

    const { t } = useTranslation();
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