import React from "react";

export default function Card({
    children,
    ...props
    }: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col bg-background rounded-lg shadow-md p-4 card" {...props}>
            {children}
        </div>
    );
}
