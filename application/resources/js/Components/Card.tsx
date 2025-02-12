import React from "react";

export default function Card({
    children,
    ...props
    }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-full bg-background rounded-lg shadow-md p-4" {...props}>
            {children}
        </div>
    );
}
