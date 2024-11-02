import { useTranslation } from 'react-i18next';

type CloseIconProps = {
    color?: string;
    width?: number;
    height?: number;
};
export default function CloseIcon({
    color = '#344054',
    width = 24,
    height = 24,
}: CloseIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 25 24"
            fill="none"
        >
            <title> {t('icons.title.close')}</title>
            <path
                d="M 4.9902344 3.9902344 A 1.0001 1.0001 0 0 0 4.2929688 5.7070312 L 10.585938 12 L 4.2929688 18.292969 A 1.0001 1.0001 0 1 0 5.7070312 19.707031 L 12 13.414062 L 18.292969 19.707031 A 1.0001 1.0001 0 1 0 19.707031 18.292969 L 13.414062 12 L 19.707031 5.7070312 A 1.0001 1.0001 0 0 0 18.980469 3.9902344 A 1.0001 1.0001 0 0 0 18.292969 4.2929688 L 12 10.585938 L 5.7070312 4.2929688 A 1.0001 1.0001 0 0 0 4.9902344 3.9902344 z"
                fill={color}
            ></path>
        </svg>
    );
}
