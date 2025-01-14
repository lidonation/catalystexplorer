import { useTranslation } from 'react-i18next';

type MenuIconProps = {
    color?: string;
    width?: number;
    height?: number;
};
export default function MenuIcon({
    color = '#344054',
    width = 24,
    height = 24,
}: MenuIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <title> {t('icons.title.menu')}</title>
            <path
                d="M3.5 12H15.5M3.5 6H21.5M3.5 18H21.5"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
