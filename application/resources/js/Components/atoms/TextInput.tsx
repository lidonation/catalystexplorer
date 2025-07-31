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
        'data-testid': dataTestId,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        isFocused?: boolean;
        border?: string | null;
        'data-testid'?: string;
    },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => localRef.current as HTMLInputElement);

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={`${border} border-opacity-40 bg-background text-content focus:ring-primary focus:border-primary rounded-md shadow-xs focus:outline-none ${className}`}
            ref={localRef}
            data-testid={dataTestId}
            onKeyDown={(e) => {
                if (e.key === ' ') {
                    e.stopPropagation();
                }
            }}
        />
    );
});
