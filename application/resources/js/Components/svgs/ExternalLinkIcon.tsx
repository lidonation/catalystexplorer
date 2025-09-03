import { cn } from '@/lib/utils';

type ExternalLinkIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function ExternalLinkIcon({
    className,
    width = 16,
    height = 16,
}: ExternalLinkIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="none"
            className={cn(className)}
        >
            <path
                d="M10.25 1.25H14.75V5.75"
                stroke="#888989"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6.5 9.5L14.75 1.25"
                stroke="#888989"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12.5 8.75V13.25C12.5 13.6478 12.342 14.0294 12.0607 14.3107C11.7794 14.592 11.3978 14.75 11 14.75H2.75C2.35218 14.75 1.97064 14.592 1.68934 14.3107C1.40804 14.0294 1.25 13.6478 1.25 13.25V5C1.25 4.60218 1.40804 4.22064 1.68934 3.93934C1.97064 3.65804 2.35218 3.5 2.75 3.5H7.25"
                stroke="#888989"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
