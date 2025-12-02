import { Link } from '@inertiajs/react';
import { ReactElement } from 'react';

type IconButtonProps = {
    href?: string;
    icon: ReactElement;
    testId?: string;
    className?: string;
    onClick?: () => void;
    connected?: boolean;
    'aria-label'?: string;
};

export default function IconButton({
    href,
    icon,
    testId,
    className = '',
    onClick,
    connected = false,
    'aria-label': ariaLabel
}: IconButtonProps) {
    const gradientClass = connected
        ? 'bg-gradient-to-br from-[var(--cx-background-gradient-2-dark)] to-[var(--cx-background-gradient-2-dark)]'
        : 'bg-gradient-to-br from-[var(--cx-background-gradient-1-dark)] to-[var(--cx-background-gradient-2-dark)]';

    const borderRadiusClass = connected
        ? 'rounded-l-none rounded-r-xl'
        : 'rounded-xl';

    const baseClasses = `${gradientClass} ${borderRadiusClass} mb-2 flex z-20 justify-center px-2 py-1 transition-all duration-200  ${className}`;

    if (href) {
        return (
            <Link
                href={href}
                className={baseClasses}
                preserveState={false}
                data-testid={testId}
                aria-label={ariaLabel}
            >
                <div className="lg:h-23.5 lg:w-23.5 h-16 w-16 flex items-center justify-center">
                    {icon}
                </div>
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={baseClasses}
            data-testid={testId}
            type="button"
            aria-label={ariaLabel}
        >
            <div className="flex lg:h-23.5 lg:w-23.5 h-16 w-16 items-center justify-center">
                {icon}
            </div>
        </button>
    );
}
