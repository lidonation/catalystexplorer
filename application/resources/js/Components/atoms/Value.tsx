import React, {HTMLAttributes, ReactNode} from "react";

interface ValueLabelProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    size?: number;
    className?: string;
}

export default function Value({children, className = '', ...props}: ValueLabelProps) {
    return (
        <div
            className={`text-sm ${className}`}
            {...props}>
            {children}
        </div>
    );
}
