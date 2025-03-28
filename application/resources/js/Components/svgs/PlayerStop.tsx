import { useTranslation } from 'react-i18next';

type PlayerStopProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerStop({
    className,
    width = 24,
    height = 24,
}: PlayerStopProps) {
    const { t } = useTranslation();
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{t('icons.titles.playerStop')}</title>
            <path d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7zm12 0H7v10h10V7z" fill="#FA6220" />
        </svg>
    );
}


