import { useTranslation } from 'react-i18next';

type XProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function XIcon({
    className,
    width = 24,
    height = 24,
}: XProps) {
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
            <title>{t('icons.titles.x')}</title>
            <path
                d="M3.33333 0.300781C1.49238 0.300781 0 1.79316 0 3.63411V16.9674C0 18.8084 1.49238 20.3008 3.33333 20.3008H16.6667C18.5076 20.3008 20 18.8084 20 16.9674V3.63411C20 1.79316 18.5076 0.300781 16.6667 0.300781H3.33333ZM4.32664 4.5865H8.1064L10.7906 8.40067L14.0476 4.5865H15.2381L11.3281 9.16425L16.1496 16.0151H12.3707L9.25595 11.5898L5.47619 16.0151H4.28571L8.71838 10.8263L4.32664 4.5865ZM6.14955 5.53888L12.8674 15.0627H14.3266L7.60882 5.53888H6.14955Z"
                fill={className}
            />
        </svg>
    );
}
