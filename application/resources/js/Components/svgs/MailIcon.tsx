import { useTranslation } from 'react-i18next';

type MailIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function MailIcon({
    className,
    width = 24,
    height = 24,
}: MailIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title> {t('icons.title.mail')}</title>
            <path
                d="M12.744 2.13346L20.272 7.02667C20.538 7.19957 20.671 7.28602 20.7674 7.40134C20.8527 7.50342 20.9167 7.62149 20.9558 7.74865C21 7.89229 21 8.05092 21 8.36818V15.6999C21 17.38 21 18.2201 20.673 18.8619C20.3854 19.4263 19.9265 19.8853 19.362 20.1729C18.7202 20.4999 17.8802 20.4999 16.2 20.4999H5.8C4.11984 20.4999 3.27976 20.4999 2.63803 20.1729C2.07354 19.8853 1.6146 19.4263 1.32698 18.8619C1 18.2201 1 17.38 1 15.6999V8.36818C1 8.05092 1 7.89229 1.04417 7.74865C1.08327 7.62149 1.14735 7.50342 1.23265 7.40134C1.32901 7.28602 1.46201 7.19957 1.72802 7.02667L9.25604 2.13346M12.744 2.13346C12.1127 1.72315 11.7971 1.51799 11.457 1.43817C11.1564 1.36761 10.8436 1.36761 10.543 1.43817C10.2029 1.51799 9.88728 1.72315 9.25604 2.13346M12.744 2.13346L18.9361 6.15837C19.624 6.60547 19.9679 6.82902 20.087 7.11252C20.1911 7.36027 20.1911 7.63949 20.087 7.88724C19.9679 8.17074 19.624 8.39429 18.9361 8.84139L12.744 12.8663C12.1127 13.2766 11.7971 13.4818 11.457 13.5616C11.1564 13.6321 10.8436 13.6321 10.543 13.5616C10.2029 13.4818 9.88728 13.2766 9.25604 12.8663L3.06386 8.84139C2.37601 8.39429 2.03209 8.17074 1.91297 7.88724C1.80888 7.63949 1.80888 7.36027 1.91297 7.11252C2.03209 6.82902 2.37601 6.60547 3.06386 6.15837L9.25604 2.13346M20.5 18.4999L13.8572 12.4999M8.14282 12.4999L1.5 18.4999"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}