type PlayerRewindRightProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function PlayerRewindRight({
    className,
    width = 24,
    height = 24,
}: PlayerRewindRightProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
        >
            <path d="m0 0h24v24h-24z" fill="#fff" opacity="0" />
            <path d="m20.86 10.67-5.1-4.21a2.1 2.1 0 0 0 -2.21-.26 1.76 1.76 0 0 0 -1.05 1.59v2.59l-4.74-3.92a2.1 2.1 0 0 0 -2.21-.26 1.76 1.76 0 0 0 -1 1.59v8.42a1.76 1.76 0 0 0 1 1.59 2.23 2.23 0 0 0 .91.2 2.06 2.06 0 0 0 1.3-.46l4.74-3.92v2.59a1.76 1.76 0 0 0 1.05 1.59 2.23 2.23 0 0 0 .91.2 2.06 2.06 0 0 0 1.3-.46l5.1-4.21a1.7 1.7 0 0 0 0-2.66zm-14.36 5.24v-7.91l4.82 4zm8 0v-7.91l4.82 4z" fill="#fff" />
        </svg>
    );
}


