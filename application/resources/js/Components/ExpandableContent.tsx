import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

interface ExpandableContentProps {
    className?: string;
    children?: React.ReactNode;
    expanded?: boolean;
    lineClamp?: number;
    collapsedHeight?: number;
    transitionDuration?: string;
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
    className,
    children,
    expanded = false,
    lineClamp,
    collapsedHeight = 100,
    transitionDuration = '0.4s',
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(collapsedHeight);
    
    useEffect(() => {
        if (contentRef.current) {
            if (expanded) {
                setHeight(contentRef.current.scrollHeight);
            } else {
                setHeight(collapsedHeight);
            }
        }
    }, [expanded, children, collapsedHeight]);
    
    return (
        <div
            className={clsx('overflow-visible', className)} 
        >
            <div
                ref={contentRef}
                style={{
                    maxHeight: height,
                    overflow: 'hidden',
                    transition: `max-height ${transitionDuration} ease-in-out`,
                }}
            >
                <div className={clsx(!expanded && lineClamp ? `line-clamp-${lineClamp}` : '')}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ExpandableContent;