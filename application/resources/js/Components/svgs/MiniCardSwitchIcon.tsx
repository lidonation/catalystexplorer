import { useTranslation } from 'react-i18next';

type MiniCardSwitchIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function MiniCardSwitchIcon({
    className,
    width = 28,
    height = 28,
}: MiniCardSwitchIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width="12"
            height="13"
            viewBox="0 0 8 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
             <title>{t('icons.titles.miniCardSwitch')}</title>
            <path
                d="M4.75 1.09431V2.54C4.75 2.73602 4.75 2.83403 4.79087 2.9089C4.82683 2.97475 4.88419 3.0283 4.95475 3.06185C5.03497 3.1 5.13998 3.1 5.35 3.1H6.89895M7 3.79588V6.32C7 6.90806 7 7.20208 6.87738 7.42669C6.76952 7.62426 6.59742 7.78489 6.38574 7.88556C6.14509 8 5.83006 8 5.2 8H2.8C2.16994 8 1.85491 8 1.61426 7.88556C1.40258 7.78489 1.23048 7.62426 1.12262 7.42669C1 7.20208 1 6.90806 1 6.32V2.68C1 2.09194 1 1.79792 1.12262 1.57331C1.23048 1.37574 1.40258 1.21511 1.61426 1.11444C1.85491 1 2.16994 1 2.8 1H4.00442C4.27958 1 4.41716 1 4.54664 1.02901C4.66143 1.05473 4.77116 1.09716 4.87182 1.15473C4.98535 1.21966 5.08264 1.31046 5.27721 1.49206L6.47279 2.60794C6.66736 2.78954 6.76465 2.88034 6.83422 2.9863C6.8959 3.08025 6.94136 3.18267 6.96892 3.28981C7 3.41065 7 3.53906 7 3.79588Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
