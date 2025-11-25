import { Link } from '@inertiajs/react';
import { ReactElement } from 'react';

type IconButtonProps = {
    href?: string;
    icon: ReactElement;
    testId?: string;
    className?: string;
    onClick?: () => void;
    connected?: boolean;
};

// IconButton.tsx
export default function IconButton({ href, icon, testId, className = '', onClick, connected = false  }: IconButtonProps) {
    const gradientClass = connected 
    ? 'bg-gradient-to-br from-[var(--cx-background-gradient-2-dark)] to-[var(--cx-background-gradient-2-dark)] ' // Start with bar's end color
    : 'bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]';
    
    const borderRadiusClass = connected 
        ? 'rounded-l-none rounded-r-xl'
        : 'rounded-xl'; 
    
    const baseClasses = `${gradientClass} ${borderRadiusClass} mb-2 flex justify-center px-2 py-1 transition-all ${className}`;

    if (href) {
        return (
            <Link href={href} className={baseClasses} preserveState={false} data-testid={testId}>
                <div className="flex h-16 w-16 items-center justify-center">{icon}</div>
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClasses} data-testid={testId} type="button">
            <div className="flex h-16 w-16 items-center justify-center">{icon}</div>
        </button>
    );
}
