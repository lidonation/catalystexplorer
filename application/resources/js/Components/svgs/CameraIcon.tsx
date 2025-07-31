type CameraProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function CameraIcon({
    className,
    width = 24,
    height = 24,
}: CameraProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`fill-current ${className}`}
        >
            <path
                fillRule="evenodd"
                d="M4 5a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-2.5l-1.71-1.71A1 1 0 0015.08 3h-6.16a1 1 0 00-.7.29L6.5 5H4zm8 12a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
                fill={className}
            />
        </svg>
    );
}
