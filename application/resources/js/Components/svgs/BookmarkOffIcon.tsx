import { useTranslation } from 'react-i18next';

type BookmarkOffIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function BookmarkOffIcon({
    className,
    width = 24,
    height = 24,
}: BookmarkOffIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <title>{t('icons.titles.bookmark_off')}</title>

            <path
                d="M4.99976 7.8C4.99976 6.11984 4.99976 5.27976 5.32674 4.63803C5.61436 4.07354 6.0733 3.6146 6.63778 3.32698C7.27952 3 8.1196 3 9.79976 3H14.1998C15.8799 3 16.72 3 17.3617 3.32698C17.9262 3.6146 18.3852 4.07354 18.6728 4.63803C18.9998 5.27976 18.9998 6.11984 18.9998 7.8V21L11.9998 17L4.99976 21V7.8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
