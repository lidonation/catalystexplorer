import { useTranslation } from 'react-i18next';

type FilterLinesIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

function FilterLinesIcon({
    className,
    width = 24,
    height = 24,
}: FilterLinesIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 17 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title> {t('icons.titles.filter')}</title>
            <path
                d="M3.62402 6H13.624M1.12402 1H16.124M6.12402 11H11.124"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default FilterLinesIcon;
