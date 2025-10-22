import { cn } from '@/lib/utils';

type RawSnapshotIconProps = {
    className?: string;
    width?: number;
    height?: number;
    strokeOpacity?: number;
};

export default function RawSnapshotIcon({
    className,
    width = 19,
    height = 19,
    strokeOpacity = 0.8,
}: RawSnapshotIconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 19 19"
            fill="none"
            className={cn(className)}
        >
            <path
                d="M6.29082 9.5L9.62415 12.8333M9.62415 12.8333L12.9575 9.5M9.62415 12.8333V5.16667C9.62415 4.00774 9.62415 3.42828 9.16538 2.7795C8.86057 2.34843 7.98297 1.8164 7.4598 1.74552C6.67239 1.63884 6.37338 1.79482 5.77534 2.10678C3.11026 3.49703 1.29082 6.28604 1.29082 9.5C1.29082 14.1024 5.02178 17.8333 9.62415 17.8333C14.2265 17.8333 17.9575 14.1024 17.9575 9.5C17.9575 6.41549 16.2817 3.72239 13.7908 2.28152"
                stroke="currentColor"
                strokeOpacity={strokeOpacity}
                strokeWidth={1.66667}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
