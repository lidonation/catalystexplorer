import { useTranslation } from 'react-i18next';

type CheckIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function CheckIcon({
    className,
    width = 24,
    height = 24,
}: CheckIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title> {t('icons.title.check')}</title>
            <path
                d="M6 15.5L8 17.5L12.5 13M8 8.5V5.7C8 4.5799 8 4.01984 8.21799 3.59202C8.40973 3.21569 8.71569 2.90973 9.09202 2.71799C9.51984 2.5 10.0799 2.5 11.2 2.5H18.8C19.9201 2.5 20.4802 2.5 20.908 2.71799C21.2843 2.90973 21.5903 3.21569 21.782 3.59202C22 4.01984 22 4.5799 22 5.7V13.3C22 14.4201 22 14.9802 21.782 15.408C21.5903 15.7843 21.2843 16.0903 20.908 16.282C20.4802 16.5 19.9201 16.5 18.8 16.5H16M5.2 22.5H12.8C13.9201 22.5 14.4802 22.5 14.908 22.282C15.2843 22.0903 15.5903 21.7843 15.782 21.408C16 20.9802 16 20.4201 16 19.3V11.7C16 10.5799 16 10.0198 15.782 9.59202C15.5903 9.21569 15.2843 8.90973 14.908 8.71799C14.4802 8.5 13.9201 8.5 12.8 8.5H5.2C4.0799 8.5 3.51984 8.5 3.09202 8.71799C2.71569 8.90973 2.40973 9.21569 2.21799 9.59202C2 10.0198 2 10.5799 2 11.7V19.3C2 20.4201 2 20.9802 2.21799 21.408C2.40973 21.7843 2.71569 22.0903 3.09202 22.282C3.51984 22.5 4.07989 22.5 5.2 22.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}