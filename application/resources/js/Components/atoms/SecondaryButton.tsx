import { ButtonHTMLAttributes, ReactNode } from 'react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    'data-testid'?: string;
}

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    icon,
    iconPosition = 'left',
    'data-testid': dataTestId,
    ...props
}: SecondaryButtonProps) {
    return (
        <button
            {...props}
            type={type}
            className={
                `border-border border-opacity-50 bg-background text-5 text-content-secondary hover:bg-background-tertiary hover:text-content-secondary focus:border-border-secondary inline-flex items-center rounded-md border px-4 py-2 font-semibold tracking-widest uppercase shadow-sm transition duration-150 ease-in-out hover:cursor-pointer focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
            data-testid={dataTestId}
        >
            {icon && iconPosition === 'left' && (
                <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
                <span className="ml-2">{icon}</span>
            )}
        </button>
    );
}
