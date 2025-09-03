import Button from '@/Components/atoms/Button';
import { router, usePage } from '@inertiajs/react';
import { HeadlessModal } from '@inertiaui/modal-react';
import { X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface RoutedModalLayoutProps {
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
    dataTestId?: string;
}

interface InertiaModalProps {
    _inertiaui_modal: {
        baseUrl?: string;
    };
}

const RoutedModalLayout: React.FC<RoutedModalLayoutProps> = ({
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
    zIndex,
    dataTestId,
}) => {
    const modalRef = useRef<{ close: () => void }>(null);
    const { _inertiaui_modal } = usePage().props as any;

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
        <HeadlessModal ref={modalRef} name={name} navigate={navigate}>
            {({
                close,
                isOpen,
                config,
                afterLeave,
            }: {
                close: () => void;
                isOpen: boolean;
                config: any;
                afterLeave: () => void;
            }) => {
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
                        data-testid={dataTestId}
                    >
                        {/* Overlay */}
                        <div
                            className="bg-dark fixed inset-0 opacity-50"
                            onClick={handleClose}
                        ></div>

                        {/* Modal container */}
                        <div
                            className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} max-w-full`}
                        >
                            <div
                                className={`relative flex h-[95vh] w-[90vw] flex-col ${slideover ? 'transform transition duration-500 ease-in-out' : ''} ${isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'} ${paddingClasses} ${panelClasses || 'bg-background-lighter my-4 rounded-lg'} ${className}`}
                            >
                                {showProgress && (
                                    <div className="bg-muted absolute top-0 left-0 h-1 w-full">
                                        <div className="bg-primary h-full w-1/3 transition-all duration-300"></div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleClose}
                                    ariaLabel="Close"
                                    className="bg-background hover:bg-background-lighter absolute -top-4 -left-4 z-10 mb-0 mb-4 !rounded-full p-2 shadow-md"
                                >
                                    <X className="text-content h-5 w-5" />
                                </Button>

                                <div className="h-full overflow-y-auto">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        </HeadlessModal>
    );
};

export default RoutedModalLayout;
