import { useTranslation } from 'react-i18next';

type ChartIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function GraphIcon({
    className,
    width = 28,
    height = 25,
}: ChartIconProps) {
    const { t } = useTranslation();
    return (
        <svg 
            width={width}
            height={height}
            viewBox="0 0 28 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`size-6 ${className}`}
        >
            <title>{t('icons.titles.chart')}</title>
            <path 
                d="M24.6668 23.6667V14.3333M14.0002 23.6667V10.3333M3.3335 23.6667L3.3335 18.3333M15.8757 3.70334L22.767 6.28756M12.3985 4.20123L4.9338 9.79977M26.081 5.58579C26.8621 6.36683 26.8621 7.63316 26.081 8.41421C25.3 9.19526 24.0337 9.19526 23.2526 8.41421C22.4716 7.63316 22.4716 6.36683 23.2526 5.58579C24.0337 4.80474 25.3 4.80474 26.081 5.58579ZM4.74771 9.58579C5.52876 10.3668 5.52876 11.6332 4.74771 12.4142C3.96666 13.1953 2.70033 13.1953 1.91928 12.4142C1.13823 11.6332 1.13823 10.3668 1.91928 9.58579C2.70033 8.80474 3.96666 8.80474 4.74771 9.58579ZM15.4144 1.58579C16.1954 2.36683 16.1954 3.63316 15.4144 4.41421C14.6333 5.19526 13.367 5.19526 12.5859 4.41421C11.8049 3.63316 11.8049 2.36683 12.5859 1.58579C13.367 0.804738 14.6333 0.804738 15.4144 1.58579Z" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
}