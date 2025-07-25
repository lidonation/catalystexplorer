type NumbersIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function NumbersIcon({
    className,
    width = 24,
    height = 24,
}: NumbersIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 23 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M3.83325 21.5834H17.2499C17.7582 21.5834 18.2458 21.3814 18.6052 21.022C18.9647 20.6625 19.1666 20.175 19.1666 19.6667V7.20835L14.3749 2.41669H5.74992C5.24159 2.41669 4.75408 2.61862 4.39463 2.97807C4.03519 3.33751 3.83325 3.82502 3.83325 4.33335V8.16669"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M13.4167 2.41669V6.25002C13.4167 6.75835 13.6187 7.24586 13.9781 7.60531C14.3376 7.96475 14.8251 8.16669 15.3334 8.16669H19.1667"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.75008 13.9167C5.75008 12.8581 4.89196 12 3.83341 12C2.77487 12 1.91675 12.8581 1.91675 13.9167V15.8333C1.91675 16.8919 2.77487 17.75 3.83341 17.75C4.89196 17.75 5.75008 16.8919 5.75008 15.8333V13.9167Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.58325 12H11.4999V17.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.58325 17.75H13.4166"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
