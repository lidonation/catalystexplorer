type ShareIconProps = {
    className?: string;
    width?: number;
    height?: number;
};


export default function ShareIcon({
    className,
    width = 16,
    height = 16,
}: ShareIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M2.66663 7.33325C4.25792 7.33325 5.78405 7.96539 6.90927 9.09061C8.03449 10.2158 8.66663 11.742 8.66663 13.3333"
                stroke="#99A1B7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2.66663 2.66675C5.4956 2.66675 8.20871 3.79055 10.2091 5.79094C12.2095 7.79133 13.3333 10.5044 13.3333 13.3334"
                stroke="#99A1B7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M3.33329 13.3333C3.70148 13.3333 3.99996 13.0349 3.99996 12.6667C3.99996 12.2985 3.70148 12 3.33329 12C2.9651 12 2.66663 12.2985 2.66663 12.6667C2.66663 13.0349 2.9651 13.3333 3.33329 13.3333Z"
                stroke="#99A1B7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
