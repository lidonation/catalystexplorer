type VoltaireModeIconProps = {
    className?: string;
};

export default function VoltaireModeIcon({ className }: VoltaireModeIconProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            className={className}
        >
            <path d="M12 2a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2zm0 4a6 6 0 100 12 6 6 0 000-12z" />
        </svg>
    );
}
