import { useTranslation } from 'react-i18next';

type VerticalColumnIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function VerticalColumnIcon({
    className,
    width = 28,
    height = 28,
}: VerticalColumnIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            fill="black"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <title>{t('icons.titles.verticalColumn')}</title>
            <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 7h8a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-8zM9 7H6a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3zM4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
            />
        </svg>
    );
}

