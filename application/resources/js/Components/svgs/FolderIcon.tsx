type FolderIconProps = {
    className?: string;
    width?: number;
    height?: number;
};
export default function FolderIcon({
    className,
    width = 24,
    height = 24,
}: FolderIconProps) {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <title>Folder Icon</title>
            <path
                d="M13 7.5L11.8845 5.26892C11.5634 4.6268 11.4029 4.30573 11.1634 4.07116C10.9516 3.86373 10.6963 3.70597 10.4161 3.60931C10.0992 3.5 9.74021 3.5 9.02229 3.5H5.2C4.0799 3.5 3.51984 3.5 3.09202 3.71799C2.71569 3.90973 2.40973 4.21569 2.21799 4.59202C2 5.01984 2 5.5799 2 6.7V7.5M2 7.5H17.2C18.8802 7.5 19.7202 7.5 20.362 7.82698C20.9265 8.1146 21.3854 8.57354 21.673 9.13803C22 9.77976 22 10.6198 22 12.3V16.7C22 18.3802 22 19.2202 21.673 19.862C21.3854 20.4265 20.9265 20.8854 20.362 21.173C19.7202 21.5 18.8802 21.5 17.2 21.5H6.8C5.11984 21.5 4.27976 21.5 3.63803 21.173C3.07354 20.8854 2.6146 20.4265 2.32698 19.862C2 19.2202 2 18.3802 2 16.7V7.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
