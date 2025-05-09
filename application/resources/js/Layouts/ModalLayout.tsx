import React, { ReactNode } from 'react';
// @ts-ignore
import { Modal } from '@inertiaui/modal-react';
import { X } from 'lucide-react';
import { useRef } from 'react';
import Button from '@/Components/atoms/Button';

interface ModalLayoutProps {
    children: ReactNode;
    slideover?: boolean;
    className?: string;
}

const ModalLayout: React.FC<ModalLayoutProps> = ({
    children,
    slideover = true,
    className = '',
}) => {
    const modalRef = useRef<{ close: () => void }>(null);

    function closeModal() {
        modalRef?.current?.close();
    }

    return (
        <Modal ref={modalRef} slideover={slideover} className={`relative ${className}`}>
            <Button
                onClick={closeModal}
                ariaLabel="Close"
                className="bg-background shadow-md !rounded-full p-2 z-10 mb-4 hover:bg-background-lighter md:mb-0 md:absolute md:-top-4 md:-left-4"
            >
                <X className="w-5 h-5 text-content" />
            </Button>
            <div className="overflow-y-auto h-full">
                {children}
            </div>
        </Modal>
    );
};

export default ModalLayout;