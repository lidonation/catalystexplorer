type ArrowTopRightIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function ArrowTopRightIcon({
    className,
    width = 24,
    height = 24,
}: ArrowTopRightIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M7 17L17 7M7 7H17V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
