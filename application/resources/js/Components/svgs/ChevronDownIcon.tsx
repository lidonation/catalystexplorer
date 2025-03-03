import { useTranslation } from 'react-i18next';

type ChevronDownIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ChevronDownIcon({
    className,
    width = 14,
    height = 8,
}: ChevronDownIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 14 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title> {t('icons.titles.chevron_down')}</title>
            <path
                d="M1 1L7 7L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
