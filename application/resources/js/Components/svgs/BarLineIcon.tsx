import { useTranslation } from 'react-i18next';

type BarLineIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function BarLineIcon({
    className,
    width = 24,
    height = 24,
}: BarLineIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>{t('icons.title.barLine')}</title>
            <path
                d="M20 20.5V13.5M12 20.5V10.5M4 20.5L4 16.5M13.4067 5.5275L18.5751 7.46567M10.7988 5.90092L5.20023 10.0998M21.0607 6.93934C21.6464 7.52513 21.6464 8.47487 21.0607 9.06066C20.4749 9.64645 19.5251 9.64645 18.9393 9.06066C18.3536 8.47487 18.3536 7.52513 18.9393 6.93934C19.5251 6.35355 20.4749 6.35355 21.0607 6.93934ZM5.06066 9.93934C5.64645 10.5251 5.64645 11.4749 5.06066 12.0607C4.47487 12.6464 3.52513 12.6464 2.93934 12.0607C2.35355 11.4749 2.35355 10.5251 2.93934 9.93934C3.52513 9.35355 4.47487 9.35355 5.06066 9.93934ZM13.0607 3.93934C13.6464 4.52513 13.6464 5.47487 13.0607 6.06066C12.4749 6.64645 11.5251 6.64645 10.9393 6.06066C10.3536 5.47487 10.3536 4.52513 10.9393 3.93934C11.5251 3.35355 12.4749 3.35355 13.0607 3.93934Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
