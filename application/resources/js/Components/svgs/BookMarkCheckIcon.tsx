type BookMarkCheckIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function BookMarkCheckIcon({
    className,
    width = 24,
    height = 24,
}: BookMarkCheckIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 16 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>Bookmark Check Icon</title>
            <path
                d="M5 9L7 11L11.5 6.5M15 19.5V6.3C15 4.61984 15 3.77976 14.673 3.13803C14.3854 2.57354 13.9265 2.1146 13.362 1.82698C12.7202 1.5 11.8802 1.5 10.2 1.5H5.8C4.11984 1.5 3.27976 1.5 2.63803 1.82698C2.07354 2.1146 1.6146 2.57354 1.32698 3.13803C1 3.77976 1 4.61984 1 6.3V19.5L8 15.5L15 19.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
