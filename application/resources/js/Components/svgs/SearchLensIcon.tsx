
import { cn } from '@/lib/utils';

type SearchLensIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function SearchLensIcon({
    className,
    width = 24,
    height = 24,
}: SearchLensIconProps) {

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 18 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn(className)}
        >
            <path
                d="M16.624 16L13.7074 13.0833M15.7907 8.08333C15.7907 11.9954 12.6194 15.1667 8.70736 15.1667C4.79534 15.1667 1.62402 11.9954 1.62402 8.08333C1.62402 4.17132 4.79534 1 8.70736 1C12.6194 1 15.7907 4.17132 15.7907 8.08333Z"
                stroke="currentColor"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
