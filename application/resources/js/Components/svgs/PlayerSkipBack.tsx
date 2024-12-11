import { useTranslation } from 'react-i18next';

type PlayerSkipBackProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerSkipBack({
    className,
    width = 24,
    height = 24,
}: PlayerSkipBackProps) {
    const { t } = useTranslation();
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <title>{t('icons.titles.playerSkipBack')}</title>
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M20 5v14l-12 -7z" />
            <line x1="4" y1="5" x2="4" y2="19" />
        </svg>
    );
}
