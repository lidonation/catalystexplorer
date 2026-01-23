import clsx from 'clsx';
import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';

export interface ExpandableContentAnimationProps {
    children: ReactNode;
    lineClamp?: number;
    className?: string;
    marginBottom?: number;
    contentRef?: RefObject<HTMLElement | null> | null;
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

    useLayoutEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const updateHeight = () => {
            if (!isHovered) {
                const height = card.offsetHeight;
                if (height > 0) {
                    setBaseHeight(height);
                }
            }
        };

        updateHeight();

        const resizeObserver = new ResizeObserver(() => {
            if (!isHovered) {
                updateHeight();
            }
        });
        resizeObserver.observe(card);

        return () => resizeObserver.disconnect();
    }, [children, lineClamp, isHovered]);

    const renderCardContent = () => {
        const lineHeightRem = 1.5;
        const minHeight = `${lineClamp * lineHeightRem}rem`;

        const isEmpty =
            !children ||
            (typeof children === 'string' && children.trim() === '') ||
            (Array.isArray(children) && children.every((child) => !child));

        const shouldClamp = !isEmpty && lineCount > lineClamp;

        return (
            <div
                ref={contentRef as RefObject<HTMLDivElement>}
                className={clsx(
                    'leading-snug',
                    isEmpty && 'text-gray-400 italic opacity-70',
                )}
                style={{
                    display: shouldClamp ? '-webkit-box' : 'block',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: shouldClamp ? lineClamp : undefined,
                    overflow: shouldClamp ? 'hidden' : 'visible',
                    minHeight,
                }}
            >
                {isEmpty ? 'No description available.' : children}
            </div>
        );
    };
    return (
        <div
            className={clsx(
                'relative w-full',
                isHovered && isExpandable ? 'overflow-visible' : 'overflow-hidden',
            )}
            style={{
                height: baseHeight > 0 ? baseHeight : undefined,
            }}
        >
            <div
                ref={cardRef}
                onMouseEnter={() => handleHoverChange(true)}
                onMouseLeave={() => handleHoverChange(false)}
                className={clsx(
                    'relative top-0 right-0 left-0 w-full',
                    isHovered && isExpandable && 'absolute z-50 shadow-md',
                )}
            >
                <div className="w-full transition-shadow duration-300 ease-in-out">
                    {renderCardContent()}
                </div>
            </div>
            {baseHeight > 0 && isHovered && isExpandable && <span className="absolute bottom-0 left-0">heyyyy</span>}
        </div>
    );
}
