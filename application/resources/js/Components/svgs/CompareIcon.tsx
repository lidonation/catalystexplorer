type CompareIconProps = {
    className?: string;
    width?: number;
    height?: number;
    exists?: boolean;
    primary?: boolean;
    strokeWidth?: string;
};
export default function CompareIcon({
    className,
    width = 24,
    height = 24,
    exists,
    primary,
    strokeWidth = '1.5',
}: CompareIconProps) {
    let stroke;
    if (exists) {
        stroke = '#EE8434';
    } else if (primary) {
        stroke = '#2596be';
    } else {
        stroke = 'white';
    }

    return (
        <>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 23 22"
                fill="none"
            >
                {' '}
                <path
                    d="M14.417 11V16.5"
                    // stroke={stroke}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M11.667 13.75H17.167"
                    // stroke={stroke}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M19.0005 7.33301H9.83382C8.8213 7.33301 8.00049 8.15382 8.00049 9.16634V18.333C8.00049 19.3455 8.8213 20.1663 9.83382 20.1663H19.0005C20.013 20.1663 20.8338 19.3455 20.8338 18.333V9.16634C20.8338 8.15382 20.013 7.33301 19.0005 7.33301Z"
                    // stroke={stroke}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M4.33382 14.6663C3.32549 14.6663 2.50049 13.8413 2.50049 12.833V3.66634C2.50049 2.65801 3.32549 1.83301 4.33382 1.83301H13.5005C14.5088 1.83301 15.3338 2.65801 15.3338 3.66634"
                    // stroke={stroke}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
}
