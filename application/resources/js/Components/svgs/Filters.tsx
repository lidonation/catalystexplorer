import { useTranslation } from 'react-i18next';

type ActiveFilterProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function Filters({
    className,
    width = 24,
    height = 24,
}: ActiveFilterProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>{t('icons.title.filters')}</title>
            <path d="M3.375 6.5H13.375M0.875 1.5H15.875M5.875 11.5H10.875" stroke="#344054" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    );
}

