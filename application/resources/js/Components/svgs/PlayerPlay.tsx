type PlayerPlayProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerPlay({
    className,
    width = 24,
    height = 24,
}: PlayerPlayProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 24 24"
            width={width}
            height={height}
            fill="none"
        >
            <path
                d="m6 6.741c0-1.544 1.674-2.505 3.008-1.728l9.015 5.26c1.323.771 1.323 2.683 0 3.455l-9.015 5.258c-1.334.778-3.008-.183-3.008-1.726zm11.015 5.259-9.015-5.259v10.519z"
                fill="#2596BE"
            />
        </svg>
    );
}
