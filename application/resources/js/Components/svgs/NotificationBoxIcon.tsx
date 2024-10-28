type NotificationBoxIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function NotificationBoxIcon({
    className,
    width = 24,
    height = 24,
}: NotificationBoxIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>Notification Box Icon</title>
            <path
                d="M11 4.5H7.8C6.11984 4.5 5.27976 4.5 4.63803 4.82698C4.07354 5.1146 3.6146 5.57354 3.32698 6.13803C3 6.77976 3 7.61984 3 9.3V16.7C3 18.3802 3 19.2202 3.32698 19.862C3.6146 20.4265 4.07354 20.8854 4.63803 21.173C5.27976 21.5 6.11984 21.5 7.8 21.5H15.2C16.8802 21.5 17.7202 21.5 18.362 21.173C18.9265 20.8854 19.3854 20.4265 19.673 19.862C20 19.2202 20 18.3802 20 16.7V13.5M20.1213 4.37868C21.2929 5.55025 21.2929 7.44975 20.1213 8.62132C18.9497 9.79289 17.0503 9.79289 15.8787 8.62132C14.7071 7.44975 14.7071 5.55025 15.8787 4.37868C17.0503 3.20711 18.9497 3.20711 20.1213 4.37868Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
