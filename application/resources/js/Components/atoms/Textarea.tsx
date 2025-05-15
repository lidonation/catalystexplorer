import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import Paragraph from './Paragraph';
import { useTranslation } from 'react-i18next';

interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
    isFocused?: boolean;
    minLengthEnforced?: boolean;
    minLengthValue?: number;
}

export default forwardRef(function Textarea(
    {
        className = '',
        isFocused = false,
        minLengthEnforced = false,
        minLengthValue = 200,
        onChange,
        ...props
    }: TextareaProps,
    ref,
) {
    const localRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(props.value as string);
    
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    const isTooShort =
        minLengthEnforced && value.length > 0 && value.length < minLengthValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        if (onChange) onChange(e);
    };

    return (
        <>
            <textarea
                {...props}
                className={`border ${
                    isTooShort
                        ? 'border-red-500 focus:border-red-500 focus:ring-0'
                        : 'border-gray-light border-opacity-40 focus:border-primary'
                } bg-background text-content rounded-md shadow-xs ${className}`}
                ref={localRef}
                value={value}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === ' ') {
                        e.stopPropagation();
                    }
                }}
            />
            <div className="mt-1 mb-2 flex items-center justify-between">
                <Paragraph
                    size="sm"
                    className={`text-[0.75rem] ${isTooShort ? 'text-red-500' : 'text-gray-persist'}`}
                >
                    {t('minCharTextarea')}
                </Paragraph>
                <Paragraph
                    size="sm"
                    className="text-gray-persist text-[0.75rem]"
                >
                    {value.length}/200
                </Paragraph>
            </div>
        </>
    );
});
