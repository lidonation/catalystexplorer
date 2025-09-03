import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React, { useState } from 'react';

interface TransitionMenuProps {
    trigger: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pages: React.ReactElement[];
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    alignOffset?: number;
    width?: string;
}
const TransitionDropdown = ({
    open,
    onOpenChange,
    trigger,
    pages,
    side = 'bottom',
    align = 'center',
    sideOffset = 5,
    alignOffset = 0,
    width = '220px',
}: TransitionMenuProps) => {
    const [currentPage, setCurrentPage] = useState(0);

    const navigateToPage = (pageIndex: number) => {
        setCurrentPage(pageIndex);
    };

    return (
        <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="bg-background z-50 overflow-hidden rounded-lg shadow-lg"
                    style={{ width }}
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                >
                    <div className="relative">
                        <div className="relative">
                            <div
                                className="flex transition-transform duration-300 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentPage * 100}%)`,
                                }}
                            >
                                {pages.map((page, index) => (
                                    <div
                                        key={index}
                                        className="w-full shrink-0"
                                        style={{ width }}
                                    >
                                        {React.cloneElement(page, {
                                            onNavigate: navigateToPage,
                                            currentPage,
                                            totalPages: pages.length,
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default TransitionDropdown;
