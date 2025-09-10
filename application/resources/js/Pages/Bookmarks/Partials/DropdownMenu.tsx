import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import { ChevronDown } from 'lucide-react';

export interface DropdownMenuItem {
    label: string;
    onClick?: () => void;
    href?: string;
    type?: 'button' | 'link';
    disabled?: boolean;
    disabledTooltip?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    isDefault?: boolean;
}

interface DropdownMenuProps {
    items: DropdownMenuItem[];
    trigger?: React.ReactNode;
    className?: string;
    dropdownClassName?: string;
    buttonClassName?: string;
    separatorClassName?: string;
    dropdownArrowClassName?: string;
    showDropdownArrow?: boolean;
    customDropdownIcon?: React.ReactNode;
    matchButtonWidth?: boolean;
    useSimpleTrigger?: boolean;
}

const DropdownMenu = ({
    items,
    trigger,
    className = 'relative',
    dropdownClassName = 'absolute right-0 top-full mt-2 w-48 bg-background border border-gray-persist/0.4 rounded-lg shadow-lg z-50 overflow-visible',
    buttonClassName,
    separatorClassName = 'border-l border-white/30',
    dropdownArrowClassName = 'px-3 hover:bg-opacity-90 transition-colors duration-200',
    showDropdownArrow = true,
    customDropdownIcon,
    matchButtonWidth = false,
    useSimpleTrigger = false
}: DropdownMenuProps) => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const dropdownContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonContainerRef.current &&
                !buttonContainerRef.current.contains(event.target as Node) &&
                dropdownContentRef.current &&
                !dropdownContentRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleItemClick = (item: DropdownMenuItem) => {
        setDropdownOpen(false);
        if (item.onClick) {
            item.onClick();
        }
    };

    const handleDefaultItemClick = (item: DropdownMenuItem) => {
        if (!item.disabled && item.onClick) {
            item.onClick();
        }
    };

    // Find the default item or use the first item
    const defaultItem = items.find(item => item.isDefault) || items[0];
    const dropdownItems = items; // Include all items in dropdown

    // Default button styles with custom className appended
    const buttonStyles = `bg-secondary text-white ${buttonClassName || ''}`.trim();

    const dropdownContent = dropdownOpen && dropdownItems.length > 0 ? (
        <div
            ref={dropdownContentRef}
            className={useSimpleTrigger ? 
                'absolute right-0 top-full mt-2 bg-background border border-gray-persist/0.4 rounded-lg shadow-lg z-50 overflow-visible min-w-max max-w-xs' : 
                `${dropdownClassName}`
            }
            style={{
                width: matchButtonWidth && buttonContainerRef.current ? `${buttonContainerRef.current.offsetWidth}px` : undefined,
                zIndex: 99999,
                position: 'fixed',
                top: buttonContainerRef.current ? `${buttonContainerRef.current.getBoundingClientRect().bottom + 8}px` : 'auto',
                left: useSimpleTrigger && buttonContainerRef.current 
                    ? `${buttonContainerRef.current.getBoundingClientRect().right}px`
                    : buttonContainerRef.current ? `${buttonContainerRef.current.getBoundingClientRect().left}px` : 'auto',
                transform: useSimpleTrigger ? 'translateX(-100%)' : undefined
            }}
            data-testid="dropdown-menu-list"
        >
            <div className="py-1" data-testid="dropdown-menu-items">
                {dropdownItems.map((item, index) => {
                    const isDisabled =
                        item.disabled ||
                        (item.type === 'link' && !item.href);
                    const baseClassName =
                        useSimpleTrigger ? 'block px-4 py-2 text-sm bg-background whitespace-normal break-words' : 'block px-4 py-2 text-sm bg-background';
                    const enabledClassName = `${baseClassName} text-gray-persist hover:bg-gray-persist/10`;
                    const disabledClassName = `${baseClassName} text-gray-persist/90 cursor-not-allowed`;

                    // Wrapper for tooltip functionality
                    const wrapWithTooltip = (
                        element: React.ReactNode,
                    ) => {
                        if (isDisabled && item.disabledTooltip) {
                            return (
                                <div
                                    key={index}
                                    className="group relative"
                                    title={item.disabledTooltip}
                                    data-testid={`dropdown-item-${index}-tooltip-wrapper`}
                                >
                                    {element}
                                    <div
                                        className="bg-dark pointer-events-none absolute top-1/2 right-full z-10 mr-2 -translate-y-1/2 rounded px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                        data-testid={`dropdown-item-${index}-tooltip`}
                                    >
                                        {item.disabledTooltip}
                                        <div className="border-l-gray-persist absolute top-1/2 left-full -translate-y-1/2 border-4 border-transparent"></div>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div
                                key={index}
                                data-testid={`dropdown-item-${index}-wrapper`}
                            >
                                {element}
                            </div>
                        );
                    };

                    const renderItemContent = () => (
                        <div className="flex items-center">
                            {item.icon && item.iconPosition === 'left' && (
                                <div className="mr-2">{item.icon}</div>
                            )}
                            <div>{item.label}</div>
                            {item.icon && item.iconPosition === 'right' && (
                                <div className="ml-2">{item.icon}</div>
                            )}
                        </div>
                    );

                    if (
                        item.type === 'link' &&
                        item.href &&
                        !isDisabled
                    ) {
                        return wrapWithTooltip(
                            <a
                                href={item.href}
                                className={enabledClassName}
                                onClick={() => handleItemClick(item)}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-testid={`dropdown-link-item-${index}`}
                            >
                                {renderItemContent()}
                            </a>,
                        );
                    }

                    if (item.type === 'link' && isDisabled) {
                        return wrapWithTooltip(
                            <div
                                className={disabledClassName}
                                data-testid={`dropdown-disabled-link-item-${index}`}
                            >
                                {renderItemContent()}
                            </div>,
                        );
                    }

                    return wrapWithTooltip(
                        <Button
                            className={
                                isDisabled
                                    ? disabledClassName
                                    : `${enabledClassName} w-full text-left`
                            }
                            onClick={() =>
                                !isDisabled && handleItemClick(item)
                            }
                            disabled={isDisabled}
                            data-testid={`dropdown-button-item-${index}`}
                        >
                            {renderItemContent()}
                        </Button>,
                    );
                })}
            </div>
        </div>
    ) : null;

    // Custom trigger provided
    if (trigger) {
        return (
            <div
                className={className}
                ref={buttonContainerRef}
                data-testid="dropdown-menu-container"
            >
                <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    data-testid="dropdown-custom-trigger"
                >
                    {trigger}
                </div>

                {dropdownContent && ReactDOM.createPortal(dropdownContent, document.body)}
            </div>
        );
    }

    // Simple three-dots trigger
    if (useSimpleTrigger) {
        const defaultTrigger = (
            <Button
                className="text-grey-persist text-md p-2 text-nowrap hover:cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                data-testid="dropdown-menu-trigger"
            >
                ⋮
            </Button>
        );

        return (
            <div
                className={className}
                ref={buttonContainerRef}
                data-testid="dropdown-menu-container"
            >
                {defaultTrigger}
                {dropdownContent && ReactDOM.createPortal(dropdownContent, document.body)}
            </div>
        );
    }

    // Default button-style dropdown with split design
    return (
        <div
            className={className}
            data-testid="dropdown-menu-container"
        >
            <div className="flex rounded-lg shadow-sm overflow-hidden" ref={buttonContainerRef}>
                {/* Main Default Button */}
                <Button
                    className={`flex items-center justify-center px-5 h-[50px] transition-colors duration-200 ${
                        defaultItem?.disabled 
                            ? 'cursor-not-allowed' 
                            : buttonStyles
                    } ${
                        !defaultItem?.disabled ? 'hover:bg-secondary/80' : ''
                    } ${items.length > 1 && showDropdownArrow ? '!rounded-l-lg !rounded-r-none' : '!rounded-lg'}`}
                    onClick={() => {
                        if (defaultItem && !defaultItem.disabled) {
                            handleDefaultItemClick(defaultItem);
                        }
                    }}
                    disabled={defaultItem?.disabled}
                    dataTestId="dropdown-default-button"
                    ariaLabel={defaultItem?.disabled ? defaultItem.disabledTooltip : undefined}
                >
                    {defaultItem?.icon && defaultItem?.iconPosition === 'left' && (
                        <div className="mr-2">{defaultItem.icon}</div>
                    )}
                    <Paragraph size="sm" className="font-semibold">
                        {defaultItem?.label}
                    </Paragraph>
                    {defaultItem?.icon && defaultItem?.iconPosition === 'right' && (
                        <div className="ml-2">{defaultItem.icon}</div>
                    )}
                </Button>

                {/* Dropdown Arrow Button (only show if there are items and showDropdownArrow is true) */}
                {items.length > 1 && showDropdownArrow && (
                    <Button
                        className={`${separatorClassName} ${dropdownArrowClassName} h-[50px] !rounded-r-lg !rounded-l-none transition-colors duration-200 ${buttonStyles} hover:bg-secondary/80`}
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        dataTestId="dropdown-arrow-button"
                    >
                        {customDropdownIcon || <ChevronDown className="w-5 h-5" />}
                    </Button>
                )}
            </div>

            {dropdownContent && ReactDOM.createPortal(dropdownContent, document.body)}
        </div>
    );
};

export default DropdownMenu;
