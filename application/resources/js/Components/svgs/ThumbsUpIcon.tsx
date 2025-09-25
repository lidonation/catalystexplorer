type ThumbsUpIconProps = {
    className?: string;
    width?: number;
    height?: number;
    color?: string;
};

function ThumbsUpIcon({
    className = "text-success",
    width = 16,
    height = 16
}: ThumbsUpIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 12 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M3.5 11.5V6M1 7V10.5C1 11.0523 1.44772 11.5 2 11.5H8.71312C9.45348 11.5 10.0831 10.9598 10.1957 10.2281L10.7341 6.72809C10.8739 5.81945 10.1709 5 9.25158 5H7.5C7.22386 5 7 4.77614 7 4.5V2.73292C7 2.052 6.448 1.5 5.76708 1.5C5.60467 1.5 5.45749 1.59565 5.39153 1.74406L3.63197 5.70307C3.55172 5.88363 3.37266 6 3.17506 6H2C1.44772 6 1 6.44772 1 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default ThumbsUpIcon;
