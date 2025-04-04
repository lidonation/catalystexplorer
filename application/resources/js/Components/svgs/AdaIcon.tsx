import { useTranslation } from 'react-i18next';

type AdaIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function AdaIcon({
    className,
    width = 32,
    height = 32,
}: AdaIconProps) {
    const { t } = useTranslation();
    return (
        <svg width={width}
            height={height}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 18"
            className={`size-6 ${className}`}
        >
            <title>{t('icons.titles.ada')}</title>
            <path d="M9.96331 0.863999L12.1473 7.272H15.5553V9.048H12.7473L13.3233 10.776H15.5553V12.552H13.9233L15.7953 18H12.1713L10.4673 12.552H5.54731L3.81931 18H0.195312L2.04331 12.552H0.435313V10.776H2.64331L3.21931 9.048H0.435313V7.272H3.81931L6.00331 0.863999H9.96331ZM9.38731 9.048H6.65131L6.09931 10.776H9.91531L9.38731 9.048ZM7.99531 3.912C7.94731 4.184 7.87531 4.528 7.77931 4.944C7.69931 5.344 7.60331 5.76 7.49131 6.192C7.39531 6.608 7.29931 6.968 7.20331 7.272H8.83531C8.78731 7.096 8.73131 6.888 8.66731 6.648C8.60331 6.408 8.53931 6.168 8.47531 5.928C8.41131 5.672 8.34731 5.424 8.28331 5.184C8.21931 4.928 8.16331 4.696 8.11531 4.488C8.06731 4.264 8.02731 4.072 7.99531 3.912Z" fill="#3FACD1" />
            </svg>

    );
}
