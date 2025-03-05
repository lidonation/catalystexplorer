import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/atoms/TextInput';
import Title from '@/Components/atoms/Title';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface UpdateProfileFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    fieldName: string;
    fieldLabel?: string;
    currentValue?: string;
    inputType?: string;
    updateRoute?: string;
    placeholder?: string;
    onFieldUpdated?: (fieldName: string, value: string) => void;
}

export default function UpdateProfileFieldModal({
    isOpen,
    onClose,
    title,
    fieldName,
    fieldLabel,
    currentValue,
    inputType = 'text',
    updateRoute = 'profile.update.field',
    placeholder = '',
    onFieldUpdated,
}: UpdateProfileFieldModalProps) {
    const { t } = useTranslation();

    console.log('Modal props:', {
        fieldName,
        fieldLabel,
        currentValue,
        inputType,
        updateRoute,
    });

    const { data, setData, patch, processing, errors, reset } = useForm({
        [fieldName]: currentValue || '',
    });

    console.log('Initial form data:', data);

    useEffect(() => {
        console.log('Setting form data for', fieldName, 'to', currentValue);
        setData(fieldName, currentValue || '');
    }, [currentValue, fieldName, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const valueToSubmit = data[fieldName as keyof typeof data] as string;

        patch(
            generateLocalizedRoute(updateRoute, {
                field: fieldName,
            }),
            {
                onSuccess: () => {
                    if (onFieldUpdated) {
                        onFieldUpdated(fieldName, valueToSubmit);
                    }
                    onClose();
                    reset(fieldName);
                },
                onError: (errors) => {
                    console.error('Form submission errors:', errors);
                },
                preserveScroll: true,
            },
        );
    };

    if (!isOpen) return null;

    // Extract the value from the data object using a safer approach
    const inputValue = (data[fieldName as keyof typeof data] as string) || '';

    // Log the current value that will be displayed in the input
    console.log('Input value to be displayed:', inputValue);

    return (
        <div className="bg-opacity-25 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="bg-background mx-4 w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 ease-in-out">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-300 ease-in-out">
                    <Title level="5" className="text-content">
                        {title || t('updateProfileField')}
                    </Title>
                    <button
                        onClick={onClose}
                        className="text-content-gray transition-colors duration-300 ease-in-out"
                    >
                        <span className="text-xl">×</span>
                    </button>
                </div>

                <form onSubmit={submit} className="p-4">
                    <div className="mb-4">
                        <InputLabel
                            htmlFor={fieldName}
                            value={fieldLabel || t(fieldName)}
                            className="text-content-gray mb-2 text-sm"
                        />
                        <TextInput
                            id={fieldName}
                            type={inputType}
                            name={fieldName}
                            value={inputValue}
                            onChange={(e) => {
                                console.log(
                                    'Input changed to:',
                                    e.target.value,
                                );
                                setData(fieldName, e.target.value);
                            }}
                            placeholder={placeholder}
                            className={`w-full px-3 py-2 ${errors[fieldName] ? 'border-error' : ''}`}
                            required
                        />
                        <InputError
                            message={errors[fieldName]}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-primary hover:bg-primary-dark w-full rounded-md px-4 py-2 text-white transition duration-200 disabled:opacity-75"
                        >
                            {processing ? t('loading') : t('update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
