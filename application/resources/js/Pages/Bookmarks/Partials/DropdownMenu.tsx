import Button from '@/Components/atoms/Button';
import Paragraph from '@/Components/atoms/Paragraph';
import { useEffect, useRef, useState } from 'react';

export interface DropdownMenuItem {
    label: string;
    onClick: () => void;
    href?: string;
    type?: 'button' | 'link';
    disabled?: boolean;
    disabledTooltip?: string;
}

interface DropdownMenuProps {
    items: DropdownMenuItem[];
    trigger?: React.ReactNode;
    className?: string;
    dropdownClassName?: string;
}

const DropdownMenu = ({
    items,
    trigger,
    className = 'relative',
    dropdownClassName = 'absolute right-0 top-full mt-2 w-48 bg-background border border-gray-persist/0.4 rounded-lg shadow-lg z-50 overflow-visible',
}: DropdownMenuProps) => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
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
        item.onClick();
    };

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
            ref={dropdownRef}
            data-testid="dropdown-menu-container"
        >
            {trigger ? (
                <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    data-testid="dropdown-custom-trigger"
                >
                    {trigger}
                </div>
            ) : (
                defaultTrigger
            )}

            {dropdownOpen && (
                <div
                    className={dropdownClassName}
                    data-testid="dropdown-menu-list"
                >
                    <div className="py-1" data-testid="dropdown-menu-items">
                        {items.map((item, index) => {
                            const isDisabled =
                                item.disabled ||
                                (item.type === 'link' && !item.href);
                            const baseClassName =
                                'block px-4 py-2 text-sm bg-background';
                            const enabledClassName = `${baseClassName} text-gray-persist hover:bg-gray-100`;
                            const disabledClassName = `${baseClassName} text-gray-persist/[50%] cursor-not-allowed`;

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
                                        {item.label}
                                    </a>,
                                );
                            }

                            if (item.type === 'link' && isDisabled) {
                                return wrapWithTooltip(
                                    <Paragraph
                                        className={disabledClassName}
                                        data-testid={`dropdown-disabled-link-item-${index}`}
                                    >
                                        {item.label}
                                    </Paragraph>,
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
                                    {item.label}
                                </Button>,
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
