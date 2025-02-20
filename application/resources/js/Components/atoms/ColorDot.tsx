import React, {HTMLAttributes} from "react";

interface ColorDotProps extends HTMLAttributes<HTMLDivElement> {
    color: string;
    size?: number;
    className?: string;
}

export default function ColorDot({ color, size = 2, className = '', ...props }: ColorDotProps) {
    return (
        <div
            className={`size-${size} rounded-full ${color} ${className}`}
            {...props}
        ></div>);
}
