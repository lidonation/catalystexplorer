import { useEffect } from 'react';
import { X } from 'lucide-react';
import Paragraph from './atoms/Paragraph';
import Button from './atoms/Button';

interface WorkflowSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function WorkflowSlideOver({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}: WorkflowSlideOverProps) {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-xl',
        xl: 'max-w-2xl'
    };

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="bg-dark absolute inset-0 opacity-50"
                onClick={onClose}
            />

            {/* Slide Over Panel */}
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                <div 
                    className={`pointer-events-auto w-screen ${sizeClasses[size]} transform transition-transform duration-300 ${
                        isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl rounded-l-lg">
                        {/* Header */}
                        <div className="border-b border-gray-persist/[20%] px-4 py-5 sm:px-6 bg-background">
                            <div className="flex items-center justify-between">
                                <Paragraph className="text-md font-semibold leading-6 text-content">
                                    {title}
                                </Paragraph> 
                                <div className="ml-3 flex h-7 items-center">
                                    <Button
                                        type="button"
                                        className="relative"
                                        onClick={onClose}
                                    >
                                        <X className="h-6 w-6 text-gray-persist/[70%]" aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative flex-1 px-4 py-6 sm:px-6 overflow-y-auto bg-background">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
