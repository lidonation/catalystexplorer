import { useTranslation } from 'react-i18next';

type GitHubProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function GitHubIcon({
    className,
    width = 24,
    height = 24,
}: GitHubProps) {
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
            <title>{t('icons.titles.github')}</title>
            <path
                fill={className}
                d="M12 .297C5.373.297 0 5.67 0 12.297c0 5.302 3.438 9.8 8.205 11.385.6.112.82-.26.82-.577v-2.17c-3.338.726-4.033-1.416-4.033-1.416-.546-1.39-1.332-1.76-1.332-1.76-1.09-.744.083-.729.083-.729 1.204.083 1.837 1.236 1.837 1.236 1.07 1.833 2.805 1.304 3.49.996.107-.776.418-1.304.76-1.604-2.665-.302-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.303-.535-1.52.117-3.164 0 0 1.008-.322 3.3 1.23.96-.267 1.99-.4 3.01-.405 1.02.005 2.05.138 3.01.405 2.29-1.552 3.297-1.23 3.297-1.23.654 1.644.242 2.86.12 3.164.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.922.43.37.812 1.103.812 2.222v3.293c0 .32.218.693.825.576C20.565 22.094 24 17.6 24 12.297 24 5.67 18.627.297 12 .297Z"
            />
        </svg>
    );
}
