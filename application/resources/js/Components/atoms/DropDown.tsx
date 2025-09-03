import Title from '@/Components/atoms/Title';
import { ReactNode, useEffect, useRef } from 'react';

interface GlobalPopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
    mode?: 'modal' | 'dropdown';
    triggerRef?: React.RefObject<HTMLElement>;
    position?: {
        top?: number | string;
        left?: number | string;
        right?: number | string;
        bottom?: number | string;
    };
}

export default function DropDown({
    isOpen,
    onClose,
    title,
    children,
    className = '',
    mode = 'modal',
    triggerRef,
    position,
}: GlobalPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            mode === 'dropdown' &&
            triggerRef?.current &&
            popupRef.current &&
            isOpen
        ) {
            const triggerRect = triggerRef.current.getBoundingClientRect();

            popupRef.current.style.top = `${triggerRect.bottom + window.scrollY}px`;
            popupRef.current.style.left = `${triggerRect.left + window.scrollX}px`;

            if (position) {
                if (position.top !== undefined)
                    popupRef.current.style.top =
                        typeof position.top === 'number'
                            ? `${position.top}px`
                            : position.top;
                if (position.left !== undefined)
                    popupRef.current.style.left =
                        typeof position.left === 'number'
                            ? `${position.left}px`
                            : position.left;
                if (position.right !== undefined)
                    popupRef.current.style.right =
                        typeof position.right === 'number'
                            ? `${position.right}px`
                            : position.right;
                if (position.bottom !== undefined)
                    popupRef.current.style.bottom =
                        typeof position.bottom === 'number'
                            ? `${position.bottom}px`
                            : position.bottom;
            }
        }
    }, [isOpen, mode, triggerRef, position]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        }

        function handleEscKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const CloseButton = () => (
        <div className="absolute top-2 right-2">
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onClose();
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </a>
        </div>
    );

    if (mode === 'modal') {
        return (
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                <div
                    ref={popupRef}
                    className={`relative max-w-md rounded-lg bg-white p-6 shadow-xl ${className}`}
                >
                    <CloseButton />

                    {title && (
                        <Title level="2" className="mb-4">
                            {title}
                        </Title>
                    )}

                    <div>{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50"
            style={{ background: 'transparent' }}
        >
            <div
                ref={popupRef}
                className={`bg-background absolute rounded-md shadow-lg ${className}`}
                style={{ position: 'absolute' }}
            >
                <CloseButton />

                {title && (
                    <div className="border-b border-gray-200 px-4 py-2">
                        <Title level="3">{title}</Title>
                    </div>
                )}
                <div className="pt-2">{children}</div>
            </div>
        </div>
    );
}
