import { cn } from '@/lib/utils';

type ImageFrameIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function ImageFrameIcon({
    className,
    width = 87,
    height = 88,
}: ImageFrameIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 87 88"
            fill="none"
            className={cn(className)}
        >
            <path
                d="M68.875 11.375H18.125C14.1209 11.375 10.875 14.6209 10.875 18.625V69.375C10.875 73.3791 14.1209 76.625 18.125 76.625H68.875C72.8791 76.625 76.125 73.3791 76.125 69.375V18.625C76.125 14.6209 72.8791 11.375 68.875 11.375Z"
                stroke="#CFD0D0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M32.625 40.375C36.6291 40.375 39.875 37.1291 39.875 33.125C39.875 29.1209 36.6291 25.875 32.625 25.875C28.6209 25.875 25.375 29.1209 25.375 33.125C25.375 37.1291 28.6209 40.375 32.625 40.375Z"
                stroke="#CFD0D0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M76.125 54.8749L64.9382 43.6881C63.5787 42.329 61.7349 41.5654 59.8125 41.5654C57.8901 41.5654 56.0463 42.329 54.6868 43.6881L21.75 76.6249"
                stroke="#CFD0D0"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}