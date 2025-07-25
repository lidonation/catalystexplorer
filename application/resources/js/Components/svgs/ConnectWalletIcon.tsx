type ConnectWalletIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

function ConnectWalletIcon({ className, width = 24, height = 24 }: ConnectWalletIconProps) {
    return (
        <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.3778 20.0899C16.6693 21.3312 14.6117 21.9998 12.4999 21.9998C10.3881 21.9998 8.33054 21.3312 6.62206 20.0899M16.8836 3.01182C18.7817 3.93756 20.338 5.44044 21.3294 7.30504C22.3208 9.16964 22.6965 11.3002 22.4026 13.3915M2.59733 13.3914C2.30343 11.3002 2.67911 9.16955 3.67053 7.30494C4.66196 5.44034 6.21823 3.93747 8.1163 3.01172M17.9999 11.9998C17.9999 15.0373 15.5375 17.4998 12.4999 17.4998C9.46235 17.4998 6.99991 15.0373 6.99991 11.9998C6.99991 8.96219 9.46235 6.49976 12.4999 6.49976C15.5375 6.49976 17.9999 8.96219 17.9999 11.9998Z" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default ConnectWalletIcon;
