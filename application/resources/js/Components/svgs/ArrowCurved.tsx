type ArrowCurvedIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ArrowCurvedIcon({
    className,
    width = 28,
    height = 28,
}: ArrowCurvedIconProps) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 7 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M5.66675 4.33594L3.66675 6.33594L1.66675 4.33594"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3.66675 6.33333V3C3.66675 2.46957 3.45603 1.96086 3.08096 1.58579C2.70589 1.21071 2.19718 1 1.66675 1H1.00008"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
