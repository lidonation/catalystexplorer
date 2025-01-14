import { useTranslation } from 'react-i18next';

type PlayerRewindLeftProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerRewindLeft({
    className,
    width = 24,
    height = 24,
}: PlayerRewindLeftProps) {
    const { t } = useTranslation();
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
        >
            <title>{t('icons.titles.playerRewindLeft')}</title>
            <path d="m0 0h24v24h-24z" fill="#fff" opacity="0" transform="matrix(-1 0 0 -1 24 24)" />
            <path d="m18.45 6.2a2.1 2.1 0 0 0 -2.21.26l-4.74 3.92v-2.59a1.76 1.76 0 0 0 -1.05-1.59 2.1 2.1 0 0 0 -2.21.26l-5.1 4.21a1.7 1.7 0 0 0 0 2.66l5.1 4.21a2.06 2.06 0 0 0 1.3.46 2.23 2.23 0 0 0 .91-.2 1.76 1.76 0 0 0 1.05-1.59v-2.59l4.74 3.92a2.06 2.06 0 0 0 1.3.46 2.23 2.23 0 0 0 .91-.2 1.76 1.76 0 0 0 1.05-1.59v-8.42a1.76 1.76 0 0 0 -1.05-1.59zm-8.95 9.8-4.82-4 4.82-3.91zm8 0-4.82-4 4.82-3.91z" fill="#fff" />
        </svg>
    );
}



