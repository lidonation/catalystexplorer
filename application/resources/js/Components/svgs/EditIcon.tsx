type EditIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function EditIcon({
    className,
    width = 24,
    height = 24,
}: EditIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Rounded square outline */}
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
            />

            {/* Pencil icon */}
            <path
                d="M14.5 8C14.2239 8 13.9479 8.10536 13.7322 8.32108L9.5 12.5535L9 15L11.4465 14.5L15.6787 10.2678C16.1101 9.83629 16.1101 9.13708 15.6787 8.70558C15.4631 8.48986 15.1871 8.38451 14.911 8.38451"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Small circle in the top-right */}
            <circle cx="17" cy="7" r="1.5" fill="currentColor" />
        </svg>
    );
}
