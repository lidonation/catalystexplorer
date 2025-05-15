import React, { useEffect, useRef } from 'react'
import Button from '@/Components/atoms/Button';
import { router } from '@inertiajs/react';
// @ts-ignore
import { Modal } from '@inertiaui/modal-react';
import { X } from 'lucide-react';

interface ModalLayoutProps {
    children: React.ReactNode;
    slideover?: boolean;
    className?: string;
    closeButton?: boolean;
    closeExplicitly?: boolean;
    maxWidth?: string;
    paddingClasses?: string;
    panelClasses?: string;
    position?: string;
    showProgress?: boolean;
    navigate?: boolean;
    name?: string | null;
    onModalClosed?: () => void;
    onModalOpened?: () => void;
}

const ModalLayout: React.FC<ModalLayoutProps> = ({
    children,
    slideover = true,
    className = '',
    closeButton = false,
    closeExplicitly = false,
    paddingClasses = 'p-4 sm:p-6',
    panelClasses,
    position = 'right',
    name = null,
    showProgress = false,
    navigate = true,
    onModalClosed,
    onModalOpened,
}) => {
    const modalRef = useRef<{ close: () => void }>(null);

    useEffect(() => {
        onModalOpened?.();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [onModalOpened]);

    const handleButtonClose = () => {
        modalRef.current?.close();
    };

    const setupOnFinishListener = () => {
        if (onModalClosed) {
            const unregisterListener = router.on('finish', () => {
                onModalClosed();
                unregisterListener();
            });
        }
    };

    return (
        <Modal
            ref={modalRef}
            closeButton={closeButton}
            paddingClasses={paddingClasses}
            position={position}
            showProgress={showProgress}
            closeExplicitly={closeExplicitly}
            navigate={navigate}
            name={name}
            panelClasses={`bg-background lg:my-4 min-h-screen rounded-lg ${panelClasses}`}
            slideover={slideover}
            className={`relative ${className}`}
            onClose={setupOnFinishListener}
        >
            <Button
                onClick={handleButtonClose}
                ariaLabel="Close"
                className="bg-background hover:bg-background-lighter z-10 mb-4 !rounded-full p-2 shadow-md md:absolute md:-top-4 md:-left-4 md:mb-0"
            >
                <X className="text-content h-5 w-5" />
            </Button>
            <div className="h-full overflow-y-auto">{children}</div>
        </Modal>
    );
};

export default ModalLayout;
