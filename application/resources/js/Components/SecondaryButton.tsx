import { ButtonHTMLAttributes, ReactNode } from 'react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    icon,
    iconPosition = 'left',
    ...props
}: SecondaryButtonProps) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-border border-opacity-50 bg-background px-4 py-2 text-5 font-semibold uppercase tracking-widest text-content-secondary shadow-sm transition duration-150 ease-in-out hover:bg-background-tertiary hover:text-content-secondary focus:outline-hidden focus:ring-2 focus:border-border-secondary focus:ring-offset-2 disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </button>
    );
}
