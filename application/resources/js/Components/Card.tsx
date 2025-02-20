import React, {HTMLAttributes, ReactNode} from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export default function Card({
    children,
    ...props
    }: CardProps) {
    const classNames = props?.className ?? '';
    delete props.className;
    return (
        <div className={`flex flex-col bg-background rounded-lg shadow-md p-4 card ${classNames}`} {...props}>
            {children}
        </div>
    );
}
