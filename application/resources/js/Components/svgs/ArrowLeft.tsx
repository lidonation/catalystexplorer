type ArrowLeftIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ArrowLeftIcon({
    className,
    width = 16,
    height = 10,
}: ArrowLeftIconProps) {
    return (
        <svg
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 16 10"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <path
                d="M5 1L1 5L5 9"
                stroke="currentColor"
                strokeOpacity="0.8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M1 5H15"
                stroke="currentColor"
                strokeOpacity="0.8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
