import { Link } from '@inertiajs/react';
import { ReactElement } from 'react';

type IconButtonProps = {
    href?: string;
    icon: ReactElement;
    testId?: string;
    className?: string;
    onClick?: () => void;
};

export default function IconButton({ href, icon, testId, className = '', onClick }: IconButtonProps) {
    const baseClasses =
        `bg-bg-dark hover:bg-opacity-90 mb-4 flex items-center justify-center overflow-hidden rounded-xl px-4 py-3 shadow-lg transition-all ${className}`;

    if (href) {
        return (
            <Link
                href={href}
                className={baseClasses}
                preserveState={false}
                data-testid={testId}
            >
                <div className="flex h-8 w-8 items-center justify-center">
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
        >
            <div className="flex h-8 w-8 items-center justify-center">
                {icon}
            </div>
        </button>
    );
}
