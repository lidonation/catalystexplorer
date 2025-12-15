import { useLaravelReactI18n } from 'laravel-react-i18n';

export default function LinksSortOptions() {
    const { t } = useLaravelReactI18n();

    return [
        {
            label: t('sort.newest'),
            value: 'created_at:desc',
        },
        {
            label: t('sort.oldest'),
            value: 'created_at:asc',
        },
        {
            label: t('sort.titleAZ'),
            value: 'title:asc',
        },
        {
            label: t('sort.titleZA'),
            value: 'title:desc',
        },
        {
            label: t('sort.type'),
            value: 'type:asc',
        },
        {
            label: t('sort.status'),
            value: 'status:desc',
        },
        {
            label: t('sort.modelType'),
            value: 'model_type:asc',
        },
    ];
}