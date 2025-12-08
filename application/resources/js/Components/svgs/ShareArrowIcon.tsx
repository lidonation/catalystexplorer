type ShareArrowIconProps = {
    className?: string;
    width?: number;
    height?: number;
    color?: string;
};

export default function ShareArrowIcon({
    className,
    width = 13,
    height = 14,
    color = "#2596BE",
}: ShareArrowIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 13 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M8.125 1.75H11.375V5.25"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.41675 8.16667L11.3751 1.75"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.75 7.58333V11.0833C9.75 11.3928 9.63586 11.6895 9.4327 11.9083C9.22953 12.1271 8.95398 12.25 8.66667 12.25H2.70833C2.42102 12.25 2.14547 12.1271 1.9423 11.9083C1.73914 11.6895 1.625 11.3928 1.625 11.0833V4.66667C1.625 4.35725 1.73914 4.0605 1.9423 3.84171C2.14547 3.62292 2.42102 3.5 2.70833 3.5H5.95833"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
