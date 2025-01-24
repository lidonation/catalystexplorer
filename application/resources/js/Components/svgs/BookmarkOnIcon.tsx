import { useTranslation } from 'react-i18next';

type BookmarkOnIconProps = {
    className?: string;
    width?: number;
    height?: number;
    count?: number;
};

export default function BookmarkOnIcon({
    className,
    width = 25,
    height = 24,
    count = 6,
}: BookmarkOnIconProps) {
    const { t } = useTranslation();
    return (
        <div className="relative inline-block">
            {count > 0 && (
                <div className="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white rounded-full px-2 py-0.5 text-xs font-bold">
                    {count}
                </div>
            )}
            <svg
                width={width}
                height={height}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 25 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={className}
            >
                <title>{t('icons.titles.bookmark_on')}</title>
                <path
                    d="M5.2915 8.3C5.2915 6.61984 5.2915 5.77976 5.61848 5.13803C5.9061 4.57354 6.36505 4.1146 6.92953 3.82698C7.57127 3.5 8.41135 3.5 10.0915 3.5H14.4915C16.1717 3.5 17.0117 3.5 17.6535 3.82698C18.218 4.1146 18.6769 4.57354 18.9645 5.13803C19.2915 5.77976 19.2915 6.61984 19.2915 8.3V21.5L12.2915 17.5L5.2915 21.5V8.3Z"
                    fill="#EE8434"
                    stroke="#EE8434"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12.2915 13.5V10.5M12.2915 7.5V10.5M9.2915 10.5H12.2915M15.2915 10.5H12.2915"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
