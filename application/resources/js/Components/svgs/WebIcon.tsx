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
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`fill-current ${className}`}
        >
            <g clipPath="url(#clip0_7455_8)">
                <title>{t('icons.titles.web')}</title>
                <path
                    d="M9.3 15.5C8.8 15.5 7.8 16.3 7.6 16.3C7.5 16.3 7.2 15.9 7.1 15.8C6.4 14.8 6 13.6 5.9 12.3H8.6C8.6 13.4 8.9 14.4 9.3 15.4V15.5Z"
                    fill={className}
                />
                <path
                    d="M9.3 8.2C8.9 9.3 8.6 10.4 8.6 11.6H5.9C5.9 10.3 6.4 9 7.2 8C7.3 7.9 7.6 7.5 7.7 7.4C7.9 7.4 8.9 8.2 9.3 8.1V8.2Z"
                    fill={className}
                />
                <path
                    d="M11.2 5.5C10.6 6.1 10.1 6.8 9.7 7.5C9.7 7.5 8.4 7 8.3 6.9C8.3 6.9 8.8 6.5 8.9 6.4C9.6 6 10.4 5.6 11.2 5.5Z"
                    fill={className}
                />
                <path
                    d="M11.4 18.6C10.2 18.3 9.00001 17.8 8.10001 16.9C8.30001 16.7 9.50001 16.1 9.70001 16.2C10 16.8 10.4 17.4 10.9 17.9C10.9 18 11.5 18.5 11.5 18.6H11.4Z"
                    fill={className}
                />
                <path
                    d="M12.1 5.7V8L10.4 7.8C10.6 7.4 10.9 6.9 11.3 6.6C11.5 6.4 11.8 6 12 5.9C12 5.9 12 5.8 12.2 5.9L12.1 5.7Z"
                    fill={className}
                />
                <path
                    d="M12.1 8.8V11.6H9.5C9.5 10.6 9.8 9.5 10.2 8.5L12.3 8.8H12.1Z"
                    fill={className}
                />
                <path
                    d="M12.1 12.4V14.9C11.4 14.9 10.7 15.1 10 15.2C9.6 14.3 9.4 13.4 9.3 12.4H12.1Z"
                    fill={className}
                />
                <path
                    d="M12.1 15.7V18.1C11.4 17.5 10.8 16.8 10.3 15.9C10.3 15.8 11.9 15.6 12.1 15.6V15.7Z"
                    fill={className}
                />
                <path
                    d="M14.6 15.9C14.1 16.7 13.6 17.5 12.8 18.1V15.7C13 15.7 14.6 15.8 14.6 16V15.9Z"
                    fill={className}
                />
                <path
                    d="M14.6 7.8L12.9 8V5.7C13 5.7 13 5.7 13.1 5.7C13.3 5.9 13.7 6.3 13.8 6.5C14.1 6.9 14.3 7.3 14.6 7.7V7.8Z"
                    fill={className}
                />
                <path
                    d="M15.7 12.4C15.6 13.4 15.4 14.3 15 15.2C14.3 15.2 13.6 14.9 12.9 14.9V12.4H15.7Z"
                    fill={className}
                />
                <path
                    d="M15.7 11.6H12.9V8.8L15 8.5C15.5 9.4 15.7 10.5 15.7 11.6Z"
                    fill={className}
                />
                <path
                    d="M16.7 6.9L15.3 7.5C14.9 6.8 14.4 6.1 13.8 5.5C14.8 5.7 15.9 6.2 16.6 6.9H16.7Z"
                    fill={className}
                />
                <path
                    d="M16.9 17C16.6 17.2 16.3 17.4 16 17.6C15.2 18.1 14.4 18.4 13.6 18.6C13.6 18.6 14.1 18 14.2 17.9C14.7 17.4 15 16.7 15.4 16.1C15.5 16.1 16.7 16.7 16.9 16.8C16.9 16.8 16.9 16.8 16.9 17Z"
                    fill={className}
                />
                <path
                    d="M19.1 12.4C19.1 13.6 18.6 14.9 17.9 15.9C17.9 16 17.6 16.4 17.4 16.4C17.1 16.4 16.1 15.5 15.7 15.6C16 14.6 16.3 13.6 16.4 12.5H19.1V12.4Z"
                    fill={className}
                />
                <path
                    d="M19.1 11.6H16.4C16.4 10.4 16.1 9.3 15.7 8.2C16.1 8.2 17.1 7.5 17.3 7.5C17.5 7.5 18.4 8.8 18.5 9.1C18.9 9.9 19.1 10.8 19.2 11.6H19.1Z"
                    fill={className}
                />
                <path
                    d="M20.8 0H4.2C1.9 0 0 1.8 0 4V20C0 22.2 1.9 24 4.2 24H20.9C23.2 24 25.1 22.2 25.1 20V4C25.1 1.8 23.2 0 20.9 0H20.8ZM19.2 15C17.1 19.8 10.7 20.9 7.1 17.1C3.4 13.3 4.9 6.7 10 5C16.1 2.8 21.8 9 19.2 15Z"
                    fill={className}
                />
            </g>
            <defs>
                <clipPath id="clip0_7455_8">
                    <rect width="25" height="24" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
