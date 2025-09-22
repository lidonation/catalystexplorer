type EyeIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function EyeIcon({
    className,
    width = 18,
    height = 18,
}: EyeIconProps) {
    return (
        <svg
            width={width}
            height={width}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.96078 8.77764C1.90175 8.61861 1.90175 8.44367 1.96078 8.28464C2.53573 6.89054 3.51169 5.69854 4.76491 4.85978C6.01813 4.02101 7.49218 3.57324 9.0002 3.57324C10.5082 3.57324 11.9823 4.02101 13.2355 4.85978C14.4887 5.69854 15.4647 6.89054 16.0396 8.28464C16.0986 8.44367 16.0986 8.61861 16.0396 8.77764C15.4647 10.1717 14.4887 11.3637 13.2355 12.2025C11.9823 13.0413 10.5082 13.489 9.0002 13.489C7.49218 13.489 6.01813 13.0413 4.76491 12.2025C3.51169 11.3637 2.53573 10.1717 1.96078 8.77764Z"
                stroke="#2596BE"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9 10.6562C10.1736 10.6562 11.125 9.70485 11.125 8.53125C11.125 7.35764 10.1736 6.40625 9 6.40625C7.82639 6.40625 6.875 7.35764 6.875 8.53125C6.875 9.70485 7.82639 10.6562 9 10.6562Z"
                stroke="#2596BE"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
