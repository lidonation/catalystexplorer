type ArrowDownIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function ArrowDownIcon({
    className,
    width = 24,
    height = 24,
}: ArrowDownIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 8 5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M4 4.47036C3.825 4.47036 3.70833 4.41202 3.59167 4.29536L0.675 1.37869C0.441667 1.14536 0.441667 0.795357 0.675 0.562024C0.908333 0.328691 1.25833 0.328691 1.49167 0.562024L4 3.07036L6.50833 0.562024C6.74167 0.328691 7.09167 0.328691 7.325 0.562024C7.55833 0.795357 7.55833 1.14536 7.325 1.37869L4.40833 4.29536C4.29167 4.41202 4.175 4.47036 4 4.47036Z"
                fill="currentColor"
            />
        </svg>
    );
}
