import { HTMLAttributes, ReactNode } from 'react';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    level?: '1' | '2' | '3' | '4' | '5' | '6';
};

function Title({
    children,
    className = 'font-bold',
    level = '1',
    id = '',
    ...props
}: TitleProps) {

    let content;

    if (level === '1') {
        content = (
            <h1
                {...props}
                className={`title-3 ${className}`}
            >
                {children}
            </h1>
        )
    } else if (level === '2') {
        content = (<h2
            id={id}
            {...props}
            className={`text-3xl ${className}`}
        >
            {children}
        </h2>)
    }  else if (level === '3') {
        content = (<h2
            id={id}
            {...props}
            className={`title-3 ${className}`}
        >
            {children}
        </h2>)
    }  else if (level === '4') {
        content = (<h2
            id={id}
            {...props}
            className={`text-xl ${className}`}
        >
            {children}
        </h2>)
    }   else if (level === '5') {
        content = (<h2
            id={id}
            {...props}
            className={`text-lg ${className}`}
        >
            {children}
        </h2>)
    } else {
        content = (<h6
            {...props}
            className={`text-content text-md ${className}`}
        >
            {children}
        </h6>)
    }

    return content;
}

export default Title;
