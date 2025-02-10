import React from "react";

export default function Card({
    children,
    ...props
    }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col bg-background rounded-md shadow-md p-4" {...props}>
            {children}
        </div>
    );
}
