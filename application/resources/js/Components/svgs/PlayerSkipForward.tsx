type PlayerSkipForwardProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerSkipForward({
    className,
    width = 24,
    height = 24,
}: PlayerSkipForwardProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 5v14l12 -7z" />
            <line x1="20" y1="5" x2="20" y2="19" />
        </svg>

    );
}



