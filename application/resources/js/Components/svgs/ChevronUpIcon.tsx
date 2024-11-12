import { useTranslation } from 'react-i18next';

type ChevronUpIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ChevronUpIcon({
    className,
    width = 14,
    height = 8,
}: ChevronUpIconProps) {
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
            <title> {t('icons.titles.chevron_up')}</title>

            <path
                d="M13 7L7 1L1 7"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}