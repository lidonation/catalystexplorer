type ChartIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function ChartIcon({
    className,
    width = 24,
    height = 24,
}: ChartIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>Chart Icon</title>
            <path
                d="M12 2.5C13.3132 2.5 14.6136 2.75866 15.8268 3.26121C17.0401 3.76375 18.1425 4.50035 19.0711 5.42893C19.9997 6.35752 20.7363 7.45991 21.2388 8.67317C21.7413 9.88643 22 11.1868 22 12.5M12 2.5V12.5M12 2.5C6.47715 2.5 2 6.97715 2 12.5C2 18.0228 6.47715 22.5 12 22.5C17.5228 22.5 22 18.0229 22 12.5M12 2.5C17.5228 2.5 22 6.97716 22 12.5M22 12.5L12 12.5M22 12.5C22 14.0781 21.6265 15.6338 20.9101 17.0399C20.1936 18.446 19.1546 19.6626 17.8779 20.5902L12 12.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
