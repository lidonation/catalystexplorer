import { useTranslation } from 'react-i18next';

type WebProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function WebIcon({
    className,
    width = 24,
    height = 24,
}: WebProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`fill-current ${className}`}
        >
            <title>{t('icons.titles.web')}</title>
            <path
                fill={className}
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm7.93 9h-3.98a15.963 15.963 0 0 0-1.5-6.45A8.036 8.036 0 0 1 19.93 11ZM12 4.06A13.985 13.985 0 0 1 14.96 11H9.04A13.985 13.985 0 0 1 12 4.06ZM4.07 13h3.98a15.963 15.963 0 0 0 1.5 6.45A8.036 8.036 0 0 1 4.07 13ZM9.04 13h5.92A13.985 13.985 0 0 1 12 19.94 13.985 13.985 0 0 1 9.04 13Zm6.41 6.45A15.963 15.963 0 0 0 15.95 13h3.98a8.036 8.036 0 0 1-4.48 6.45Z"
            />
        </svg>
    );
}
