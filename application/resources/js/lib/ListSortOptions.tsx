import { useTranslation } from "react-i18next";


const ListSortingOptions = () => {

    const { t } = useTranslation();
    return [
        {
            label: t('bookmarks.sort.alphabeticallyAZ'),
            value: 'title:asc',
        },
        {
            label: t('bookmarks.sort.updatedAtASC'),
            value: 'updated_at:desc',
        },
        {
            label: t('bookmarks.sort.itemsCountASC'),
            value: 'items_count:asc',
        },
        {
            label: t('bookmarks.sort.itemsCountDESC'),
            value: 'items_count:desc',
        },
        {
            label: t('bookmarks.sort.paymentsReceivedHighToLowUSD'),
            value: 'amount_received_USD:desc',
        },
        {
            label: t('bookmarks.sort.paymentsReceivedLowToHighUSD'),
            value: 'amount_received_USD:asc',
        },
        {
            label: t('bookmarks.sort.paymentsReceivedHighToLowADA'),
            value: 'amount_received_ADA:desc',
        },
        {
            label: t('bookmarks.sort.paymentsReceivedLowToHighADA'),
            value: 'amount_received_ADA:asc',
        },
        {
            label: t('bookmarks.sort.budgetHighToLowUSD'),
            value: 'amount_requested_USD:desc',
        },
        {
            label: t('bookmarks.sort.budgetLowToHighUSD'),
            value: 'amount_requested_USD:asc',
        },
        {
            label: t('bookmarks.sort.budgetHighToLowADA'),
            value: 'amount_requested_ADA:desc',
        },
        {
            label: t('bookmarks.sort.budgetLowToHighADA'),
            value: 'amount_requested_ADA:asc',
        },
    ];
};

export default ListSortingOptions;