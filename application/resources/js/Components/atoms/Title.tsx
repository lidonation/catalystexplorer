import { HTMLAttributes, ReactNode } from 'react';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    level?: '1' | '2' | '3';
};

function Title({
    children,
    className = '',
    level = '1',
    id = '',
    ...props
}: TitleProps) {

    let content;

    if (level === '3') {
        content = (
            <h3
                id={id}
                {...props}
                className={`title-3 ${className}`}
            >
                {children}
            </h3>
        )
    } else if (level === '2') {
        content = (<h2
            id={id}
            {...props}
            className={`title-2 ${className}`}
        >
            {children}
        </h2>)
    } else {
        content = (<h1
            id={id}
            {...props}
            className={`text-content title-1 ${className}`}
        >
            {children}
        </h1>)
    }

    return content;
}

export default Title;
