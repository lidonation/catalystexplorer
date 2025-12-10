import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function Card({ children, ...props }: CardProps) {
    const classNames = props?.className ?? '';
    delete props.className;
    return (
        <div
            className={`card flex flex-col rounded-lg p-4 shadow-md ${classNames}`}
            data-testid="campaign-card"
            {...props}
        >
            {children}
        </div>
    );
}
