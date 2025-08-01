type RegisterUserIconProps = {
    className?: string;
    width?: number;
    height?: number;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
};

export default function RegisterUserIcon({
    className,
    width = 22,
    height = 22,
    onClick
}: RegisterUserIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            onClick={onClick}
        >
            <circle
                cx="10"
                cy="7"
                r="3"
                stroke="currentColor"
                strokeWidth="1.66667"
            />
            <path
                d="M5 18C5 15.7909 6.79086 14 9 14H11C13.2091 14 15 15.7909 15 18"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16 8.5H18M17 7.5V9.5"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
