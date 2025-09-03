type PeopleIconProps = {
    stroke?: string;
    className?: string;
    width?: number;
    height?: number;
};
export default function PeopleIcon({
    className,
    stroke = 'currentColor',
    width = 24,
    height = 24,
}: PeopleIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 22 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M21 19.5V17.5C21 15.6362 19.7252 14.0701 18 13.626M14.5 1.79076C15.9659 2.38415 17 3.82131 17 5.5C17 7.17869 15.9659 8.61585 14.5 9.20924M16 19.5C16 17.6362 16 16.7044 15.6955 15.9693C15.2895 14.9892 14.5108 14.2105 13.5307 13.8045C12.7956 13.5 11.8638 13.5 10 13.5H7C5.13623 13.5 4.20435 13.5 3.46927 13.8045C2.48915 14.2105 1.71046 14.9892 1.30448 15.9693C1 16.7044 1 17.6362 1 19.5M12.5 5.5C12.5 7.70914 10.7091 9.5 8.5 9.5C6.29086 9.5 4.5 7.70914 4.5 5.5C4.5 3.29086 6.29086 1.5 8.5 1.5C10.7091 1.5 12.5 3.29086 12.5 5.5Z"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
