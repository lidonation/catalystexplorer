import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';

interface ExpandableContentProps {
    className?: string;
    children?: React.ReactNode;
    expanded?: boolean;
    lineClamp?: number;
    transitionDuration?: string;
    enableHoverExpand?: boolean;
    parentSelector?: string; // CSS selector to target parent element
}

const ExpandableContent: React.FC<ExpandableContentProps> = ({
    className,
    children,
    expanded: externalExpanded,
    lineClamp = 5,
    transitionDuration = '0.9s',
    enableHoverExpand = true,
    parentSelector = '.card', // Default selector for Card components
}) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [isHovered, setIsHovered] = useState(false);
    const [lineCount, setLineCount] = useState(0);
    
    // Use externally provided expanded state or internal hover state
    const expanded = externalExpanded !== undefined ? externalExpanded : (enableHoverExpand && isHovered);
    
    useEffect(() => {
        const calcLineCount = () => {
            if (contentRef.current) {
                const styles = window.getComputedStyle(contentRef.current);
                const lineHeight = parseFloat(styles.lineHeight);
                const height = contentRef.current.scrollHeight;
                const calculatedLineCount = !isNaN(lineHeight) 
                    ? Math.round(height / lineHeight)
                    : Math.round(height / (parseInt(styles.fontSize, 10) * 1.2));
                setLineCount(calculatedLineCount);
            }
        };
        
        calcLineCount();
        
        // Add resize observer to recalculate on size changes
        const resizeObserver = new ResizeObserver(calcLineCount);
        if (contentRef.current) {
            resizeObserver.observe(contentRef.current);
        }
        
        return () => {
            resizeObserver.disconnect();
        };
    }, [children]);
    
    useEffect(() => {
        if (contentRef.current) {
            if (expanded) {
                setHeight(contentRef.current.scrollHeight);
            } else {
                const styles = window.getComputedStyle(contentRef.current);
                const lineHeight = parseFloat(styles.lineHeight);
                const calculatedHeight = !isNaN(lineHeight)
                    ? lineHeight * lineClamp
                    : parseInt(styles.fontSize, 10) * 1.2 * lineClamp;
                
                setHeight(calculatedHeight);
            }
        }
    }, [expanded, children, lineClamp]);
    
    useEffect(() => {
        if (!contentRef.current || !parentSelector || lineCount <= lineClamp) return;
        
        const parentElement = contentRef.current.closest(parentSelector);
        if (!parentElement) return;
        
        const htmlParent = parentElement as HTMLElement;
        
        if (expanded) {
            htmlParent.classList.add('z-30', 'shadow-md', 'absolute', 'top-0', 'right-0', 'left-0', 'w-full');
            htmlParent.classList.remove('z-0', 'relative');
            
            htmlParent.style.transition = `all ${transitionDuration} ease, transform ${transitionDuration} ease`;
        } else {
            htmlParent.classList.remove('z-30', 'shadow-md', 'absolute', 'top-0', 'right-0', 'left-0', 'w-full');
            htmlParent.classList.add('z-0', 'relative');
        }
        
        return () => {
            htmlParent.classList.remove('z-30', 'shadow-md', 'absolute', 'top-0', 'right-0', 'left-0', 'w-full');
            htmlParent.classList.add('z-0', 'relative');
            htmlParent.style.transition = '';
        };
    }, [expanded, parentSelector, lineCount, lineClamp, transitionDuration]);
    

    const enhanceChildrenWithHover = (childElements: React.ReactNode): React.ReactNode => {
        return React.Children.map(childElements, (child) => {
        
            if (!React.isValidElement(child)) {
                return child;
            }
            

            const childProps = {
                ...child.props,
                expanded,
                style: {
                    ...(child.props.style || {}),
                    transition: `all ${transitionDuration} ease`,
                }
            };
          
            return React.cloneElement(
                child,
                childProps as React.ClassAttributes<unknown> & typeof child.props,
               
                child.props.children
                    ? enhanceChildrenWithHover(child.props.children)
                    : child.props.children
            );
        });
    };
    
    const enhancedChildren = enhanceChildrenWithHover(children);
    
    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                ref={contentRef}
                style={{
                    maxHeight: height,
                    overflow: 'hidden',
                    transition: `max-height ${transitionDuration} ease-in-out`,
                }}
                className={clsx('relative', className)}
            >
                <div className={clsx(!expanded && `line-clamp-${lineClamp}`)}>
                    {enhancedChildren}
                </div>
            </div>
        </div>
    );
};

export default ExpandableContent;