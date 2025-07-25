type ConnectIconProps = {
    className?: string;
};

export default function ConnectIcon({ className }: ConnectIconProps) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.66663 7.33203C4.25792 7.33203 5.78405 7.96417 6.90927 9.08939C8.03449 10.2146 8.66663 11.7407 8.66663 13.332"
                stroke="#99A1B7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M2.66663 2.66797C5.4956 2.66797 8.20871 3.79178 10.2091 5.79216C12.2095 7.79255 13.3333 10.5057 13.3333 13.3346"
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
