import { useTranslation } from 'react-i18next';

type DiscordProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function DiscordIcon({
    className,
    width = 24,
    height = 24,
}: DiscordProps) {
    const { t } = useTranslation();
    return (
        <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`fill-current ${className}`}
        >
            <title>{t('icons.titles.discord')}</title>
            <g clip-path="url(#clip0_7428_36757)">
                <path
                    d="M11.1 12.7C11.1 14 9.7 15.2 8.5 14.3C7.2 13.3 7.7 11 9.3 10.9C10.3 10.9 11.1 11.8 11.1 12.7Z"
                    fill={className}
                />
                <path
                    d="M15.7 14.5C13.5 14.7 13.2 11 15.4 10.8C17.6 10.6 17.8 14.3 15.7 14.5Z"
                    fill={className}
                />
                <path
                    d="M20.8 0H4.2C1.9 0 0 1.8 0 4V20C0 22.2 1.9 24 4.2 24H20.9C23.2 24 25.1 22.2 25.1 20V4C25.1 1.8 23.2 0 20.9 0H20.8ZM21.8 15.9C21.8 16.1 21.8 16.5 21.8 16.6C21.8 16.6 21.2 17 21.1 17.1C19.9 17.9 18.6 18.5 17.2 18.9C17.1 18.9 16.8 18.4 16.7 18.2C16.5 17.9 16.3 17.6 16.2 17.3L17.8 16.6L17.5 16.4C17.5 16.4 16.9 16.6 16.7 16.7C14.2 17.6 11.6 17.7 9 16.7C8.9 16.7 8.1 16.3 8 16.3C8 16.3 7.7 16.5 7.6 16.5L9.1 17.2C8.9 17.6 8.7 17.9 8.5 18.2C8.5 18.2 8.1 18.8 8 18.8C6.3 18.3 4.8 17.5 3.4 16.5C2.9 12.8 4 9 6.1 6C7 5.6 8 5.2 8.9 5C9.1 5 9.7 4.8 9.8 4.8C9.8 4.9 10.2 5.7 10.3 5.7C11.2 5.5 12.2 5.5 13.1 5.5L14.5 5.7C14.7 5.4 14.8 5 15 4.7C16 4.8 17 5.1 17.9 5.5C18.1 5.5 18.7 5.8 18.8 5.9C18.9 6 19.1 6.4 19.2 6.6C20.6 8.8 21.4 11.4 21.6 14C21.6 14.5 21.6 15.1 21.6 15.6L21.8 15.9Z"
                    fill={className}
                />
            </g>
            <defs>
                <clipPath id="clip0_7428_36757">
                    <rect width="25" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
