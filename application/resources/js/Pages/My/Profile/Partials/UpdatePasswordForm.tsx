import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/atoms/TextInput';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler } from 'react';

interface PasswordFormProps {
    onClose: () => void;
}

export default function PasswordForm({ onClose }: PasswordFormProps) {
    const { t } = useLaravelReactI18n();

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
            onError: (errors) => {
                console.error('Password update errors:', errors);
            },
            onFinish: () => {
                console.log('Password update request completed');
            },
            preserveScroll: true,
        });
    };

    return (
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
                    onChange={(e) => setData('password', e.target.value)}
                    className={`w-full px-3 py-2 ${errors.password ? 'border-error' : ''}`}
                    required
                />
                <InputError message={errors.password} className="mt-2" />
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
    );
}
