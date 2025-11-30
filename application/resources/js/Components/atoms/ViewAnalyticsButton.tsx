import Button from './Button';

type ViewAnalyticsButtonProps = {
    onClick?: () => void;
    className?: string;
    showText?: boolean;
};

export default function ViewAnalyticsButton({
    onClick,
    className = '',
    showText = true,
}: ViewAnalyticsButtonProps) {
    return (
        <Button
            className={`bg-cyan-600 hover:bg-cyan-700 transition-colors rounded-md inline-flex justify-center items-center gap-1 overflow-hidden  px-4 py-3 ${className}`}
            onClick={onClick}
            ariaLabel="View Analytics"
        >
            {/* Analytics Icon SVG */}
            <svg 
                width="14" 
                height="14" 
                viewBox="0 0 14 14" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
            >
                <path 
                    d="M5.25 11.0833V7.58333C5.25 7.27391 5.12708 6.97717 4.90829 6.75838C4.6895 6.53958 4.39275 6.41667 4.08333 6.41667H2.91667C2.60725 6.41667 2.3105 6.53958 2.09171 6.75838C1.87292 6.97717 1.75 7.27391 1.75 7.58333V11.0833C1.75 11.3928 1.87292 11.6895 2.09171 11.9083C2.3105 12.1271 2.60725 12.25 2.91667 12.25H4.08333C4.39275 12.25 4.6895 12.1271 4.90829 11.9083C5.12708 11.6895 5.25 11.3928 5.25 11.0833ZM5.25 11.0833V5.25C5.25 4.94058 5.37292 4.64383 5.59171 4.42504C5.8105 4.20625 6.10725 4.08333 6.41667 4.08333H7.58333C7.89275 4.08333 8.1895 4.20625 8.40829 4.42504C8.62708 4.64383 8.75 4.94058 8.75 5.25V11.0833M5.25 11.0833C5.25 11.3928 5.37292 11.6895 5.59171 11.9083C5.8105 12.1271 6.10725 12.25 6.41667 12.25H7.58333C7.89275 12.25 8.1895 12.1271 8.40829 11.9083C8.62708 11.6895 8.75 11.3928 8.75 11.0833M8.75 11.0833V2.91667C8.75 2.60725 8.87292 2.3105 9.09171 2.09171C9.3105 1.87292 9.60725 1.75 9.91667 1.75H11.0833C11.3928 1.75 11.6895 1.87292 11.9083 2.09171C12.1271 2.3105 12.25 2.60725 12.25 2.91667V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H9.91667C9.60725 12.25 9.3105 12.1271 9.09171 11.9083C8.87292 11.6895 8.75 11.3928 8.75 11.0833Z" 
                    stroke="white" 
                    strokeWidth="1.5"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
            
            {showText && (
                <div className="flex justify-start items-center gap-0.5">
                    <span className="text-white text-s font-medium font-['Inter'] leading-3 whitespace-nowrap">
                        View Analytics
                    </span>
                    <svg 
    width="14" 
    height="14" 
    viewBox="0 0 14 14" 
    fill="none" 
    className="flex-shrink-0"
>
    <path 
        d="M3 8L6 5L9 8" 
        stroke="white" 
        strokeWidth="1.5"
        strokeLinecap="round" 
        strokeLinejoin="round"
    />
</svg>
                </div>
            )}
        </Button>
    );
}