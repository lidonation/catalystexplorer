type ShareIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function ShareIcon({
    className,
    width = 20,
    height = 21,
}: ShareIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path 
                d="M15 7.16699C16.3807 7.16699 17.5 6.0477 17.5 4.66699C17.5 3.28628 16.3807 2.16699 15 2.16699C13.6193 2.16699 12.5 3.28628 12.5 4.66699C12.5 6.0477 13.6193 7.16699 15 7.16699Z" 
                stroke="#667085" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M5 13C6.38071 13 7.5 11.8807 7.5 10.5C7.5 9.11929 6.38071 8 5 8C3.61929 8 2.5 9.11929 2.5 10.5C2.5 11.8807 3.61929 13 5 13Z" 
                stroke="#667085" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M15 18.833C16.3807 18.833 17.5 17.7137 17.5 16.333C17.5 14.9523 16.3807 13.833 15 13.833C13.6193 13.833 12.5 14.9523 12.5 16.333C12.5 17.7137 13.6193 18.833 15 18.833Z" 
                stroke="#667085" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M7.15833 11.7588L12.85 15.0755" 
                stroke="#667085" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M12.8417 5.9248L7.15833 9.24147" 
                stroke="#667085" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );
}
