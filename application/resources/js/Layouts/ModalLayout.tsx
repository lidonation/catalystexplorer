import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { HeadlessModal } from '@inertiaui/modal-react';
import { router, usePage } from '@inertiajs/react';
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
    name?: string;
    zIndex?: string;
}

interface InertiaModalProps {
    _inertiaui_modal: {
       baseUrl?: string;
    }
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
    navigate = false,
    onModalClosed,
    onModalOpened,
    name,
    zIndex
}) => {
    const modalRef = useRef<{ close: () => void }>(null);
    const {_inertiaui_modal}= usePage().props as any;

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

    return (
        <HeadlessModal
            ref={modalRef}
            name={name}
            navigate={navigate}
        >
            {({ close, isOpen, config, afterLeave }: { close: () => void; isOpen: boolean; config: any; afterLeave: () => void }) => {

                 const handleClose = () => {
                    if (_inertiaui_modal?.baseUrl && navigate) {
                        close();
                        afterLeave();
                        router.visit(_inertiaui_modal.baseUrl);
                    } else {
                        close();
                        afterLeave();
                    }
                    
                    onModalClosed?.();
                };

                return (
                    <div
                        className={`fixed inset-0 ${zIndex} overflow-hidden ${isOpen ? 'block' : 'hidden'}`}
                    >
                        {/* Overlay */}
                         <div 
                            className="bg-dark fixed inset-0 opacity-50" 
                            onClick={handleClose}
                        ></div>

                        {/* Modal container */}
                        <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} max-w-full`}>
                            <div
                                className={`relative flex flex-col w-[90vw] h-[95vh] ${slideover ? 'transform transition ease-in-out duration-500' : ''} 
                                ${isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'}
                                ${paddingClasses} ${panelClasses || 'bg-background-lighter my-4 rounded-lg'} ${className}`}
                            >
                                {showProgress && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-muted">
                                        <div className="bg-primary h-full w-1/3 transition-all duration-300"></div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleClose}
                                    ariaLabel="Close"
                                    className="bg-background shadow-md !rounded-full p-2 z-10 mb-4 hover:bg-background-lighter mb-0 absolute -top-4 -left-4"
                                >
                                    <X className="w-5 h-5 text-content" />
                                </Button>

                                <div className="overflow-y-auto h-full">{children}</div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </HeadlessModal>
    );
};

export default ModalLayout;