import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';


export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        border = 'border-gray-light',
        isFocused = false,
        disabled = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        isFocused?: boolean;
        border?: string | null;
    },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

    useEffect(() => {
        if (isFocused && !disabled) {
            localRef.current?.focus();
        }
    }, [isFocused, disabled]);

    return (
        <input
            {...props}
            type={type}
            disabled={disabled}
            className={`${border} border-opacity-40 bg-background text-content focus:ring-primary focus:border-primary rounded-md shadow-xs focus:outline-none ${
                disabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-40 border-gray-200' 
                    : ''
            } ${className}`}
            ref={localRef}
            onKeyDown={(e) => {
                if (e.key === ' ') {
                    e.stopPropagation();
                }
            }}
        />
    );
});
