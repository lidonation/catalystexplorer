import { useTranslation } from 'react-i18next';

type FileIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function FileIcon({
    className,
    width = 18,
    height = 22,
}: FileIconProps) {
    const { t } = useTranslation();
    return (
        <svg width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg" className={`size-6 ${className}`}>
                        <title> {t('icons.title.file')}</title>
            <path d="M11 1.26946V5.4C11 5.96005 11 6.24008 11.109 6.45399C11.2049 6.64215 11.3578 6.79513 11.546 6.89101C11.7599 7 12.0399 7 12.6 7H16.7305M17 8.98822V16.2C17 17.8802 17 18.7202 16.673 19.362C16.3854 19.9265 15.9265 20.3854 15.362 20.673C14.7202 21 13.8802 21 12.2 21H5.8C4.11984 21 3.27976 21 2.63803 20.673C2.07354 20.3854 1.6146 19.9265 1.32698 19.362C1 18.7202 1 17.8802 1 16.2V5.8C1 4.11984 1 3.27976 1.32698 2.63803C1.6146 2.07354 2.07354 1.6146 2.63803 1.32698C3.27976 1 4.11984 1 5.8 1H9.01178C9.74555 1 10.1124 1 10.4577 1.08289C10.7638 1.15638 11.0564 1.27759 11.3249 1.44208C11.6276 1.6276 11.887 1.88703 12.4059 2.40589L15.5941 5.59411C16.113 6.11297 16.3724 6.3724 16.5579 6.67515C16.7224 6.94356 16.8436 7.2362 16.9171 7.5423C17 7.88757 17 8.25445 17 8.98822Z" stroke="#3FACD1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>

    );
}
