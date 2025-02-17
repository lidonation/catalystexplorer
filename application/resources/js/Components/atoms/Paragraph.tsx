import { HTMLAttributes, ReactNode } from 'react';

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
};

function Paragraph({
    children,
    className = '',
    size = 'md',
    ...props
}: ParagraphProps) {
    
    let content;

    if (size === 'sm') {
        content = (
            <p {...props} className={`text-sm ${className}`}>
                {children}
            </p>
        );
    } else if (size === 'lg') {
        content = (
            <p {...props} className={`text-lg ${className}`}>
                {children}
            </p>
        );
    } else {
        content = (
            <p {...props} className={`text-md ${className}`}>
                {children}
            </p>
        );
    }

    return content;
}

export default Paragraph;
