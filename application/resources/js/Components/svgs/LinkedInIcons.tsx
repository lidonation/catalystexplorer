import { useTranslation } from 'react-i18next';

type LinkedInProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function LinkedInIcon({
    className,
    width = 24,
    height = 24,
}: LinkedInProps) {
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
            <title>{t('icons.titles.linkedin')}</title>
            <path
                d="M3.33333 0C1.49238 0 0 1.49238 0 3.33333V16.6667C0 18.5076 1.49238 20 3.33333 20H16.6667C18.5076 20 20 18.5076 20 16.6667V3.33333C20 1.49238 18.5076 0 16.6667 0H3.33333ZM5.47619 5.2381C6.32272 5.2381 7 5.91538 7 6.7619C7 7.60843 6.32272 8.28571 5.47619 8.28571C4.62967 8.28571 3.95238 7.60843 3.95238 6.7619C3.95238 5.91538 4.62967 5.2381 5.47619 5.2381ZM4.28571 8.95238H6.66667V15.7143H4.28571V8.95238ZM8.57143 8.95238H10.7143V10.158C11.1081 9.42857 12.0338 8.85714 13.0952 8.85714C15.0952 8.85714 15.7143 10.1905 15.7143 12.0952V15.7143H13.3333V12.5C13.3333 11.6667 13.1905 10.9524 12.1905 10.9524C11.1905 10.9524 10.9524 11.6667 10.9524 12.5V15.7143H8.57143V8.95238Z"
                fill="currentColor"
            />
        </svg>
    );
}
