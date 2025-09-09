import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { useBookmarkContext } from '@/Context/BookmarkContext';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import Button from '@/Components/atoms/Button';
import TrashIcon from '@/Components/svgs/TrashIcon';
import Paragraph from './atoms/Paragraph';
import Title from './atoms/Title';

interface RemoveBookmarkButtonProps {
    proposalId: string;
    modelType: string;
    width?: number;
    height?: number;
    buttonTheme?: string;
    dataTestId?: string;
}

export default function RemoveBookmarkButton({
    proposalId,
    modelType,
    width = 24,
    height = 24,
    buttonTheme = 'text-white',
    dataTestId = 'remove-bookmark-button',
}: RemoveBookmarkButtonProps) {
    const { t } = useLaravelReactI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    
    const { toggleSelection } = useBookmarkContext();

    const handleRemove = () => {
        setIsProcessing(true);
        
        try {
            // Use the BookmarkContext method to remove the bookmark
            toggleSelection(modelType, proposalId);
            setIsOpen(false);
            setIsProcessing(false);
        } catch (error) {
            console.error('Error removing bookmark:', error);
            setIsProcessing(false);
        }
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    // Add/remove click outside listener
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
                handleCancel();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClick);
            return () => document.removeEventListener('mousedown', handleClick);
        }
    }, [isOpen]);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Button
                ref={buttonRef}
                className={`relative inline-flex gap-1 rounded-full px-0 py-0.5 outline-none ${buttonTheme} hover:text-red-500`}
                ariaLabel="remove-bookmark"
                onClick={() => setIsOpen(!isOpen)}
                dataTestId={dataTestId}
            >
                {isHovered && (
                    <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {t('bookmark.removeBookmark')}
                        </div>
                    </div>
                )}
                <TrashIcon
                    width={width}
                    height={height}
                />
            </Button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    className="fixed w-80 bg-background border border-gray-persist/[0.4] rounded-lg shadow-lg z-50 p-4"
                    style={{
                        top: buttonRef.current ? 
                            `${buttonRef.current.getBoundingClientRect().top - 150}px` : 
                            'auto',
                        left: buttonRef.current ? 
                            `${buttonRef.current.getBoundingClientRect().left - 320}px` : 
                            'auto'
                    }}
                >
                    <div className="space-y-3">
                        <div>
                            <Title level='3' className="text-lg font-medium text-content mb-2">
                                {t('bookmark.removeBookmarkTitle')}
                            </Title>
                            <Paragraph className="text-sm text-gray-persist">
                                {t('bookmark.removeBookmarkConfirmation')}
                            </Paragraph>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={handleCancel}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-sm border border-light-gray-persist rounded-md hover:bg-light-gray-persist/[0.6] disabled:opacity-50"
                                dataTestId="remove-bookmark-cancel-button"
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={handleRemove}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-sm bg-error text-white rounded-md hover:bg-error/[0.6] disabled:opacity-50"
                                dataTestId="remove-bookmark-confirm-button"
                            >
                                {isProcessing ? t('bookmark.removing') : t('bookmark.remove')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
