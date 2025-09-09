import React, { useState, useRef, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { route } from 'ziggy-js';
import Button from '@/Components/atoms/Button';
import Textarea from '@/Components/atoms/Textarea';

interface RationaleButtonProps {
    proposalId: string;
    initialRationale?: string;
    width?: number;
    height?: number;
    buttonTheme?: string;
    dataTestId?: string;
}

export default function RationaleButton({
    proposalId,
    initialRationale = '',
    width = 24,
    height = 24,
    buttonTheme = 'text-white',
    dataTestId = 'rationale-button',
}: RationaleButtonProps) {
    const { t } = useLaravelReactI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const form = useForm({
        rationale: initialRationale,
    });

    const handleSave = () => {
        if (!form.data.rationale.trim()) return;
        
        form.post(route('api.proposals.rationale.store', { id: proposalId }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
                router.reload({ only: ['proposals'] });
            },
            onError: () => {
                console.error('Error saving rationale');
            }
        });
    };

    const handleCancel = () => {
        form.setData('rationale', initialRationale);
        form.clearErrors();
        setIsOpen(false);
    };

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
    }, [isOpen, initialRationale]);

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Button
                ref={buttonRef}
                className={`relative inline-flex gap-1 rounded-full px-0 py-0.5 outline-none ${
                    initialRationale ? 'text-primary' : buttonTheme
                }`}
                ariaLabel="add-rationale"
                onClick={() => setIsOpen(!isOpen)}
                dataTestId={dataTestId}
            >
                {isHovered && (
                    <div className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {initialRationale ? t('rationale.editRationale') : t('rationale.addRationale')}
                        </div>
                    </div>
                )}
                <svg
                    width={width}
                    height={height}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-current"
                >
                    <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
                </svg>
            </Button>

            {isOpen && (
                <div
                    ref={popoverRef}
                    className="fixed w-80 bg-background border border-gray-persist/[0.4] rounded-lg shadow-lg z-50 p-4"
                    style={{
                        top: buttonRef.current ? 
                            `${buttonRef.current.getBoundingClientRect().top - 200}px` : 
                            'auto',
                        left: buttonRef.current ? 
                            `${buttonRef.current.getBoundingClientRect().left - 320}px` : 
                            'auto'
                    }}
                >
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-content mb-1">
                                {initialRationale ? t('rationale.editYourRationale') : t('rationale.addYourRationale')}
                            </label>
                            <Textarea
                                value={form.data.rationale}
                                onChange={(e) => form.setData('rationale', e.target.value)}
                                placeholder={t('rationale.placeholder')}
                                className="resize-none"
                                maxLength={5000}
                                disabled={form.processing}
                                data-testid="rationale-textarea"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                {t('rationale.characterCount', { 
                                    current: form.data.rationale.length, 
                                    max: 5000 
                                })}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={handleCancel}
                                disabled={form.processing}
                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                dataTestId="rationale-cancel-button"
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={form.processing || !form.data.rationale.trim() || form.data.rationale.length < 4}
                                className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50"
                                dataTestId="rationale-save-button"
                            >
                                {form.processing ? t('rationale.saving') : t('save')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
