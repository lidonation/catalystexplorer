import { useTranslation } from "react-i18next";


const CommunitySortingOptions = () => {

    const { t } = useTranslation();
    return [
        {
            label: t('groups.options.alphabetically'),
            value: 'name:asc',
        }
    ]
};

export default CommunitySortingOptions;