import Title from '@/Components/atoms/Title';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode } from 'react';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
}

export default function BaseModal({
    isOpen,
    onClose,
    title,
    children,
}: BaseModalProps) {
    const { t } = useLaravelReactI18n();

    if (!isOpen) return null;

    return (
        <div className="bg-dark fixed inset-0 z-50 flex items-center justify-center bg-black opacity-90">
            <div className="bg-background mx-4 w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 ease-in-out">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-300 ease-in-out">
                    <Title level="5" className="text-content">
                        {title || t('modal.default.title')}
                    </Title>
                    <button
                        onClick={onClose}
                        className="text-content-gray transition-colors duration-300 ease-in-out"
                    >
                        <span className="text-xl">×</span>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
