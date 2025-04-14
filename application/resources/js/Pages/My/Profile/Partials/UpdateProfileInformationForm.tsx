import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/atoms/TextInput';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ProfileFieldFormProps {
    fieldName: string;
    fieldLabel?: string;
    currentValue?: string;
    inputType?: string;
    updateRoute?: string;
    placeholder?: string;
    onClose: () => void;
    onFieldUpdated?: (fieldName: string, value: string) => void;
}

export default function ProfileFieldForm({
    fieldName,
    fieldLabel,
    currentValue,
    inputType = 'text',
    updateRoute = 'profile.update.field',
    placeholder = '',
    onClose,
    onFieldUpdated,
}: ProfileFieldFormProps) {
    const { t } = useTranslation();

    const { data, setData, patch, processing, errors, reset } = useForm({
        [fieldName]: currentValue || '',
    });

    useEffect(() => {
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

    const inputValue = (data[fieldName as keyof typeof data] as string) || '';

    return (
        <form onSubmit={submit} className="lg:p-4">
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
                        setData(fieldName, e.target.value);
                    }}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2 ${errors[fieldName] ? 'border-error' : ''}`}
                    required
                />
                <InputError message={errors[fieldName]} className="mt-2" />
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
    );
}
