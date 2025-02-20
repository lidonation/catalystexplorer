import React, {HTMLAttributes, ReactNode} from "react";

interface ValueLabelProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    size?: number;
    className?: string;
}

export default function ValueLabel({children, className = '', ...props }: ValueLabelProps) {
    return (
        <span
            className={`text-highlight text-sm ${className}`}
            {...props}
        >{children}</span>);
}
