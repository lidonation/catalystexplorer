import { useTranslation } from "react-i18next";

const TransactionSortOptions = () => {
    const { t } = useTranslation();

    return [
        {
            label: t('transactions.options.newestToOldest'), 
            value: 'created_at:desc',
        },
        {
            label: t('transactions.options.oldestToNewest'),
            value: 'created_at:asc',
        },
        {
            label: t('transactions.options.blockAsc'),
            value: 'block:asc',
        },
        {
            label: t('transactions.options.blockDesc'),
            value: 'block:desc',
        },
        {
            label: t('transactions.options.epochAsc'),
            value: 'epoch:asc',
        },
        {
            label: t('transactions.options.epochDesc'),
            value: 'epoch:desc',
        },
        {
            label: t('transactions.options.amountHighToLow'),
            value: 'total_ada_output:desc',
        },
        {
            label: t('transactions.options.amountLowToHigh'),
            value: 'total_ada_output:asc',
        },
        {
            label: t('transactions.options.weightHighToLow'),
            value: 'json_metadata.voter_delegations.weight:desc',
        },
        {
            label: t('transactions.options.weightLowToHigh'),
            value: 'json_metadata.voter_delegations.weight:asc',
        }
    ];
};

export default TransactionSortOptions;