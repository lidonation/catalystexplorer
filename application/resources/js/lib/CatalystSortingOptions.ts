import { useLaravelReactI18n } from 'laravel-react-i18n';

const CatalystSortingOptions = () => {
    const { t } = useLaravelReactI18n();

    return [
        {
            label: t('ideascaleProfiles.options.alphabeticallyAsc'), // Alphabetically: A to Z
            value: 'name:asc',
        },
        {
            label: t('ideascaleProfiles.options.alphabeticallyDesc'), // Alphabetically: Z to A
            value: 'name:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedAdaHighToLow'), // Amount Awarded Ada: High to Low
            value: 'amount_awarded_ada:desc',
        },
        {
            label: t('ideascaleProfiles.options.awardedAdaLowToHigh'), // Amount Awarded Ada: Low to High
            value: 'amount_awarded_ada:asc',
        },
        {
            label: 'Amount Awarded USDM: High to Low',
            value: 'amount_awarded_usdm:desc',
        },
        {
            label: 'Amount Awarded USDM: Low to High',
            value: 'amount_awarded_usdm:asc',
        },
    ];
};

export default CatalystSortingOptions;
