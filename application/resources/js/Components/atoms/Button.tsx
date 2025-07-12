import {MouseEventHandler, ReactNode, forwardRef} from 'react';

type ButtonProps = {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    children: ReactNode;
    disabled?: boolean;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    ariaLabel?: string;
    arialExpanded?: boolean;
    arialControls?: string;
    ariaPressed?: boolean;
    dataTestId?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    onClick,
    children,
    disabled = false,
    className = '',
    type = 'button',
    ariaLabel,
    arialExpanded,
    arialControls,
    ariaPressed,
    dataTestId,
}, ref) => {
    return (
        <button
            ref={ref}
            onClick={disabled ? undefined : onClick}
            type={type}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-expanded={arialExpanded}
            aria-controls={arialControls}
            aria-pressed={ariaPressed}
            className={`rounded-sm hover:cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
            data-testid={dataTestId}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
