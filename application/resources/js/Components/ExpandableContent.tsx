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
    collapsedHeight,
    transitionDuration = '0.4s',
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [initialHeight, setInitialHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (innerRef.current && initialHeight === undefined) {
            setInitialHeight(innerRef.current.offsetHeight);
        }
    }, [initialHeight]);

    useEffect(() => {
        if (contentRef.current) {
            if (expanded) {
                setHeight(contentRef.current.scrollHeight);
            } else {
                setHeight(collapsedHeight ?? initialHeight);
            }
        }
    }, [expanded, children, collapsedHeight, initialHeight]);

    return (
        <div className={clsx('overflow-visible', className)}>
            <div
                ref={contentRef}
                style={{
                    maxHeight: height,
                    overflow: 'hidden',
                    transition: height !== undefined ? `max-height ${transitionDuration} ease-in-out` : undefined,
                }}
            >
                <div
                    ref={innerRef}
                    className={clsx(
                        !expanded && lineClamp ? `line-clamp-${lineClamp}` : '',
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ExpandableContent;
