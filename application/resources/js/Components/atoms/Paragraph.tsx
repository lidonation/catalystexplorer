import { HTMLAttributes, ReactNode } from 'react';

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}

function Paragraph({
    children,
    className = '',
    size = 'md',
    ...props
}: ParagraphProps) {
    let content;

    if (size === 'xs') {
        content = (
            <p {...props} className={`text-xs m-0 ${className}`}>
                {children}
            </p>
        );
    }else if (size === 'sm') {
        content = (
            <p {...props} className={`text-sm m-0 ${className}`}>
                {children}
            </p>
        );
    } else if (size === 'lg') {
        content = (
            <p {...props} className={`text-lg m-0 ${className}`}>
                {children}
            </p>
        );
    } else {
        content = (
            <p {...props} className={`text-md m-0 ${className}`}>
                {children}
            </p>
        );
    }

    return content;
}

export default Paragraph;
