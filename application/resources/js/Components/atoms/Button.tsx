import { ReactNode } from 'react';

type ButtonProps = {
    onClick?: () => void;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
    arialExpanded?: boolean;
    arialControls?: string;
    ariaPressed?: boolean;
};

function Button({
    onClick,
    children,
    disabled = false,
    className = '',
    type = 'button',
    ariaLabel,
    arialExpanded,
    arialControls,
    ariaPressed,
}: ButtonProps) {
    return (
        <button
            onClick={disabled ? undefined : onClick}
            type={type}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-expanded={arialExpanded}
            aria-controls={arialControls}
            aria-pressed={ariaPressed}
            className={`rounded-sm text-content ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
        >
            {children}
        </button>
    );
}

export default Button;
