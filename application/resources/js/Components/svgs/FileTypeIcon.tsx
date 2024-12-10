import { useTranslation } from 'react-i18next';

type FileTypeIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function FileTypeIcon({
    className,
    width = 40,
    height = 47,
}: FileTypeIconProps) {
    const { t } = useTranslation();
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 40 47"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title> {t('icons.title.file_type')}</title>
            <g filter="url(#filter0_dd_1546_5831)">
                <path
                    d="M4 6.5C4 4.29086 5.79086 2.5 8 2.5H24L36 14.5V38.5C36 40.7091 34.2091 42.5 32 42.5H8C5.79086 42.5 4 40.7091 4 38.5V6.5Z"
                    fill="#2596BE"
                />
                <path
                    opacity="0.3"
                    d="M24 2.5L36 14.5H28C25.7909 14.5 24 12.7091 24 10.5V2.5Z"
                    fill="white"
                />
                <path
                    d="M20.6668 23.1667L19.9231 21.6793C19.7091 21.2512 19.6021 21.0372 19.4424 20.8808C19.3012 20.7425 19.131 20.6373 18.9442 20.5729C18.7329 20.5 18.4936 20.5 18.015 20.5H15.4668C14.7201 20.5 14.3467 20.5 14.0615 20.6453C13.8106 20.7732 13.6067 20.9771 13.4788 21.228C13.3335 21.5132 13.3335 21.8866 13.3335 22.6333V23.1667M13.3335 23.1667H23.4668C24.5869 23.1667 25.147 23.1667 25.5748 23.3847C25.9511 23.5764 26.2571 23.8824 26.4488 24.2587C26.6668 24.6865 26.6668 25.2466 26.6668 26.3667V29.3C26.6668 30.4201 26.6668 30.9802 26.4488 31.408C26.2571 31.7843 25.9511 32.0903 25.5748 32.282C25.147 32.5 24.5869 32.5 23.4668 32.5H16.5335C15.4134 32.5 14.8533 32.5 14.4255 32.282C14.0492 32.0903 13.7432 31.7843 13.5515 31.408C13.3335 30.9802 13.3335 30.4201 13.3335 29.3V23.1667Z"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>
            <defs>
                <filter
                    id="filter0_dd_1546_5831"
                    x="-3"
                    y="0.5"
                    width="46"
                    height="46"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="1" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.06 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_1546_5831"
                    />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.1 0"
                    />
                    <feBlend
                        mode="normal"
                        in2="effect1_dropShadow_1546_5831"
                        result="effect2_dropShadow_1546_5831"
                    />
                    <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect2_dropShadow_1546_5831"
                        result="shape"
                    />
                </filter>
            </defs>
        </svg>
    );
}
