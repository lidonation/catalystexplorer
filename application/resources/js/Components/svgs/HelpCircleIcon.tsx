import { useTranslation } from 'react-i18next';

type HelpCircleProps = {
    fill?: string;
    width?: number;
    height?: number;
};
export default function HelpCircleIcon({
    fill = 'none',
    width = 14,
    height = 14,
}: HelpCircleProps) {
    const { t } = useTranslation();
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 14 14"
            fill={fill}
        >
            <g clip-path="url(#clip0_11458_122545)">
                <path
                    d="M5.30283 5.24996C5.43997 4.8601 5.71066 4.53135 6.06697 4.32195C6.42327 4.11255 6.84218 4.03601 7.24951 4.10587C7.65684 4.17574 8.0263 4.38752 8.29245 4.70368C8.55861 5.01985 8.70427 5.42001 8.70366 5.83329C8.70366 6.99996 6.95366 7.58329 6.95366 7.58329M7.00033 9.91663H7.00616M12.8337 6.99996C12.8337 10.2216 10.222 12.8333 7.00033 12.8333C3.77866 12.8333 1.16699 10.2216 1.16699 6.99996C1.16699 3.7783 3.77866 1.16663 7.00033 1.16663C10.222 1.16663 12.8337 3.7783 12.8337 6.99996Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_11458_122545">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}
