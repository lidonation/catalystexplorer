import { useTranslation } from 'react-i18next';

type XProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function XIcon({ className, width = 48, height = 48 }: XProps) {
    const { t } = useTranslation();
    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 25 24"
            fill="text-accent-secondary"
            xmlns="http://www.w3.org/2000/svg"
            className={`fill-current ${className}`}
        >
            <title>{t('icons.titles.x')}</title>
            <path
                d="M4.16667 0C1.86548 0 0 1.79086 0 4V20C0 22.2091 1.86548 24 4.16667 24H20.8333C23.1345 24 25 22.2091 25 20V4C25 1.79086 23.1345 0 20.8333 0H4.16667ZM5.4083 5.14286H10.133L13.4882 9.71987L17.5595 5.14286H19.0476L14.1602 10.6362L20.1869 18.8571H15.4634L11.5699 13.5469L6.84524 18.8571H5.35714L10.898 12.6306L5.4083 5.14286ZM7.68694 6.28571L16.0842 17.7143H17.9083L9.51102 6.28571H7.68694Z"
                fill={className}
            />
        </svg>
    );
}
