import clsx from 'clsx';
import { ReactNode, RefObject, useEffect, useRef, useState } from 'react';

export interface ExpandableContentAnimationProps {
    children: ReactNode;
    lineClamp?: number; 
    className?: string; 
    marginBottom?: number; 
    contentRef?: RefObject<HTMLElement> | null; 
    onHoverChange?: ((hovered: boolean) => void) | null;
}
export default function ExpandableContentAnimation({
    lineClamp = 3,
    contentRef: externalContentRef = null,
    onHoverChange = null,
    children,
}: ExpandableContentAnimationProps) {
    const [isHovered, setIsHovered] = useState(false);
    const internalContentRef = useRef<HTMLDivElement | null>(null);
    const contentRef = externalContentRef || internalContentRef;
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [lineCount, setLineCount] = useState(0);
    const [baseHeight, setBaseHeight] = useState(0);
    const [isExpandable, setIsExpandable] = useState(false);

    const handleHoverChange = (hovered: boolean) => {
        setIsHovered(hovered);
        if (onHoverChange) {
            onHoverChange(hovered);
        }
    };

    useEffect(() => {
        const element = contentRef.current;
        if (element) {
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            const height = element.offsetHeight;
            const calculatedLineCount = Math.round(height / lineHeight);

            setLineCount(calculatedLineCount);
            setIsExpandable(calculatedLineCount >= lineClamp);
        }
    }, [children, lineClamp, contentRef]);

    useEffect(() => {
        if (cardRef.current && !baseHeight) {
            setBaseHeight(cardRef.current.offsetHeight);
        }
    }, [cardRef.current]);

    const renderCardContent = () => {
        return (
            <>
                <div style={{ overflow: 'visible' }}>{children}</div>
            </>
        );
    };

    return (
        <div
            className={clsx(
                'relative w-full',
                isHovered && isExpandable
                    ? 'overflow-visible'
                    : '',
            )}
            style={{
                height: baseHeight > 0 ? baseHeight : 'auto',
            }}
        >
            <div
                ref={cardRef}
                onMouseEnter={() => handleHoverChange(true)}
                onMouseLeave={() => handleHoverChange(false)}
                className={clsx(
                    'relative top-0 right-0 left-0 w-full',
                    isHovered && isExpandable && 'absolute z-30',
                )}
            >
                <div className="w-full transition-shadow duration-300 ease-in-out">
                    {renderCardContent()}
                </div>
            </div>
        </div>
    );
}
