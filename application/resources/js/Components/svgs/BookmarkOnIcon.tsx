type BookmarkOnIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function BookmarkOnIcon({
    className,
    width = 24,
    height = 24,
}: BookmarkOnIconProps) {
    return (
        <svg
            width={width}
            height={height}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <path
                d="M5 8C5 6.32 5 5.48 5.33 4.84C5.62 4.28 6.08 3.82 6.64 3.53C7.28 3.2 8.12 3.2 9.8 3.2H14.2C15.88 3.2 16.72 3.2 17.36 3.53C17.92 3.82 18.38 4.28 18.67 4.84C19 5.48 19 6.32 19 8V21L12 17L5 21V8Z"
                fill="currentColor"
                // fill="#EE8434"
                // stroke="#EE8434"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 9L15 15M15 9L9 15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
