type DarkModeIconProps = {
    className?: string;
};

export default function DarkModeIcon({ className }: DarkModeIconProps) {
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
            <path d="M21 12.79A9 9 0 0112 21a9.11 9.11 0 01-4.34-1.1 1 1 0 01.3-1.84A7 7 0 1013 5.06a1 1 0 01-1.34-1.31A9 9 0 0121 12.79z" />
        </svg>
    );
}
