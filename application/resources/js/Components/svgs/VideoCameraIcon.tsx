import { useTranslation } from 'react-i18next';

type VideoCameraIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function VideoCameraIcon({
    className,
    width = 24,
    height = 24,
}: VideoCameraIconProps) {
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
            <title>{t('icons.titles.videoCamera')}</title>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
            />
        </svg>
    );
}
