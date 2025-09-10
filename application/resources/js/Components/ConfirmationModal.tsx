import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Button from './atoms/Button';
import Title from './atoms/Title';
import Paragraph from './atoms/Paragraph';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'warning' | 'danger' | 'info';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'warning',
    isLoading = false
}) => {
    const { t } = useLaravelReactI18n();
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-error',
                    confirmButton: 'bg-error hover:bg-error/[0.8] text-white'
                };
            case 'info':
                return {
                    icon: 'text-blue-600',
                    confirmButton: 'bg-primary hover:bg-primary/[0.8] text-white'
                };
            case 'warning':
            default:
                return {
                    icon: 'text-warning',
                    confirmButton: 'bg-warning hover:bg-warning/[0.8] text-white'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <Transition show={isOpen} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex transform items-center overflow-y-auto px-4 py-6 transition-all sm:px-0"
                onClose={onClose}
            >
                {/* No overlay/backdrop */}
                
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel className="bg-background mb-6 transform overflow-hidden rounded-lg shadow-xl transition-all sm:mx-auto sm:w-full sm:max-w-md border border-gray-200">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className={`flex-shrink-0 mr-3 ${styles.icon}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <Title level={"3"} className="text-lg font-medium text-content">
                                    {title}
                                </Title>
                            </div>
                            
                            <div className="mb-6">
                                <Paragraph className="text-sm text-gray-persist">
                                    {message}
                                </Paragraph>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <Button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-persist bg-white border border-gray-persist/[0.5] rounded-md hover:bg-gray-persist/[0.1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {cancelText || t('confirmationModal.cancel')}
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={isLoading}
                                    className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton}`}
                                >
                                    {isLoading ? t('confirmationModal.processing') : (confirmText || t('confirmationModal.confirm'))}
                                </Button>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
};

export default ConfirmationModal;
