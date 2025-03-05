import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/atoms/TextInput';
import Title from '@/Components/atoms/Title';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpdatePasswordModal({
    isOpen,
    onClose,
}: UpdatePasswordModalProps) {
    const { t } = useTranslation();

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(generateLocalizedRoute('password.update'), {
            onSuccess: () => {
                onClose();
                reset('current_password', 'password', 'password_confirmation');
            },
            preserveScroll: true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="bg-opacity-25 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="bg-background mx-4 w-full max-w-md rounded-lg shadow-xl transition-colors duration-300 ease-in-out">
                <div className="flex items-center justify-between border-b border-gray-200 p-4 transition-colors duration-300 ease-in-out">
                    <Title level="5" className="text-content">
                        {t('updatePassword')}
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
                            htmlFor="current_password"
                            value={t('currentPassword')}
                            className="text-content-gray mb-2 text-sm"
                        />
                        <TextInput
                            id="current_password"
                            type="password"
                            name="current_password"
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            className={`w-full px-3 py-2 ${errors.current_password ? 'border-error' : ''}`}
                            required
                        />
                        <InputError
                            message={errors.current_password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel
                            htmlFor="password"
                            value={t('password')}
                            className="text-content-gray mb-2 text-sm"
                        />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className={`w-full px-3 py-2 ${errors.password ? 'border-error' : ''}`}
                            required
                        />
                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-6">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value={t('confirmPassword')}
                            className="text-content-gray mb-2 text-sm"
                        />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className="w-full px-3 py-2"
                            required
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary hover:bg-primary-dark w-full rounded-md px-4 py-2 text-white transition duration-200 disabled:opacity-75"
                    >
                        {processing ? t('loading') : t('update')}
                    </button>
                </form>
            </div>
        </div>
    );
}
