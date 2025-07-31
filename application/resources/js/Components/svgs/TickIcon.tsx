import { cn } from '@/lib/utils';

type PlayerPlayProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function TickIcon({
    className,
    width = 24,
    height = 24,
}: PlayerPlayProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 25 24"
            className={cn(className)}
        >
            <path
                d="M9.57801 15.642L19.22 6L20.5003 7.28025L9.57801 18.2025L4.49976 13.1257L5.78001 11.8455L9.57801 15.642Z"
                fill="currentColor"
            />
        </svg>
    );
}
