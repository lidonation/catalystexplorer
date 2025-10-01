const WalletItem = ({
    label,
    value,
    badge = false,
    children,
    className = '',
}: {
    label: string;
    value?: string;
    badge?: boolean;
    children?: React.ReactNode;
    className?: string;
}) => (
    <div className={`flex min-w-0 items-start ${className}`}>
        <div className="w-32 flex-shrink-0 pt-0.5 text-sm text-grey-persist sm:w-40">
            {label}
        </div>
        <div className="min-w-0 flex-1">
            {children ? (
                children
            ) : badge && value ? (
                <span className="rounded-md bg-gray-50/50 px-2 py-0.5 text-xs font-medium text-content outline-1 outline-offset-[-1px] outline-gray-50">
                    {value}
                </span>
            ) : (
                <div className="text-content font-medium">
                    {value || <span className="text-content/50">—</span>}
                </div>
            )}
        </div>
    </div>
);

export default WalletItem;