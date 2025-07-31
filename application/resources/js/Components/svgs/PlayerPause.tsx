type PlayerPauseProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerPause({
    className,
    width = 24,
    height = 24,
}: PlayerPauseProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={width}
            height={height}
            fill="none"
        >
            <path d="m7 2h2c1.1045695 0 2 .8954305 2 2v16c0 1.1045695-.8954305 2-2 2h-2c-1.1045695 0-2-.8954305-2-2v-16c0-1.1045695.8954305-2 2-2zm8 0h2c1.1045695 0 2 .8954305 2 2v16c0 1.1045695-.8954305 2-2 2h-2c-1.1045695 0-2-.8954305-2-2v-16c0-1.1045695.8954305-2 2-2zm-8 2v16h2v-16zm8 0v16h2v-16z" fill="#2596BE"  fillRule="evenodd" />
        </svg>

    );
}


