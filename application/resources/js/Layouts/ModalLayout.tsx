import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { Modal } from '@inertiaui/modal-react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import Button from '@/Components/atoms/Button';

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
            panelClasses={`bg-background lg:my-4 min-h-screen rounded-lg ${panelClasses}`}
            slideover={slideover}
            className={`relative ${className}`}
            onClose={setupOnFinishListener}
        >
            <Button
                onClick={handleButtonClose}
                ariaLabel="Close"
                className="bg-background shadow-md !rounded-full p-2 z-10 mb-4 hover:bg-background-lighter md:mb-0 md:absolute md:-top-4 md:-left-4"
            >
                <X className="w-5 h-5 text-content" />
            </Button>
            <div className="overflow-y-auto h-full">{children}</div>
        </Modal>
    );
};

export default ModalLayout;