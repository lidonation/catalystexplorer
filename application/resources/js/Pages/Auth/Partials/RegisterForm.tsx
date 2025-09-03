import Button from '@/Components/atoms/Button';
import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import Paragraph from '@/Components/atoms/Paragraph';
import TextInput from '@/Components/atoms/TextInput';
import InputError from '@/Components/InputError';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router, useForm } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { FormEventHandler, useState } from 'react';
import PrimaryButton from '../../../Components/atoms/PrimaryButton';
import InputLabel from '../../../Components/InputLabel';

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
}

interface RegisterFormProps {
    closeModal?: () => void;
}

export default function RegisterForm({ closeModal }: RegisterFormProps) {
    const { data, setData, processing, post, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePasswordStrength = (password: string): boolean => {
        return password.length >= 8;
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!validateEmail(data.email)) {
            newErrors.email = t('validation.emailFormat');
            isValid = false;
        }

        if (!data.password) {
            newErrors.password = t('validation.required');
            isValid = false;
        } else if (!validatePasswordStrength(data.password)) {
            newErrors.password = t('validation.passwordLength');
            isValid = false;
        }

        if (!data.password_confirmation) {
            newErrors.password_confirmation = t('validation.required');
            isValid = false;
        } else if (data.password !== data.password_confirmation) {
            newErrors.password_confirmation = t('validation.passwordMatch');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        post(generateLocalizedRoute('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                if (closeModal) closeModal();
                router.visit(generateLocalizedRoute('my.dashboard'));
            },
            onError: (serverErrors) => {
                console.log('Registration error:', serverErrors);
                setErrors(serverErrors);
            },
        });
    };

    const { t } = useLaravelReactI18n();

    const handleLoginClick = () => {
        if (closeModal) closeModal();
        router.get(generateLocalizedRoute('login'));
    };

    return (
        <form
            onSubmit={submit}
            className="content-gap flex w-full flex-col p-4"
            data-testid="register-form"
        >
            <ErrorDisplay />

            <div>
                <InputLabel
                    htmlFor="name"
                    value={t('name')}
                    data-testid="name-input-label"
                />

                <TextInput
                    id="name"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="name"
                    isFocused={true}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    data-testid="name-input"
                />

                <InputError
                    message={errors?.name}
                    className="mt-2"
                    data-testid="name-error-text"
                />
            </div>

            <div>
                <InputLabel
                    htmlFor="email"
                    value={t('email')}
                    data-testid="email-input-label"
                />

                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    autoComplete="username"
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    data-testid="email-input"
                />

                <InputError
                    message={errors?.email}
                    className="mt-2"
                    data-testid="email-error-text"
                />
            </div>

            <div>
                <InputLabel
                    htmlFor="password"
                    value={t('password')}
                    data-testid="password-input-label"
                />

                <TextInput
                    id="password"
                    type="password"
                    name="password"
                    value={data.password}
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    onChange={(e) => setData('password', e.target.value)}
                    required
                    data-testid="password-input"
                />
                <Paragraph className="text-4 text-dark mt-1">
                    {t('registration.passwordCharacters')}
                </Paragraph>
                <InputError
                    message={errors?.password}
                    className="mt-2"
                    data-testid="password-error-text"
                />
            </div>

            <div>
                <InputLabel
                    htmlFor="password_confirmation"
                    value={t('confirmPassword')}
                    data-testid="password-confirmation-input-label"
                />

                <TextInput
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    className="mt-1 block w-full"
                    autoComplete="new-password"
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    required
                    data-testid="password-confirmation-input"
                />

                <InputError
                    message={errors?.password_confirmation}
                    className="mt-2"
                    data-testid="password-confirmation-error-text"
                />
            </div>

            <div>
                <PrimaryButton
                    className="flex h-10 w-full items-center justify-center rounded-md"
                    disabled={processing}
                    type="submit"
                    data-testid="register-submit-button"
                >
                    {t('getStarted')}
                </PrimaryButton>
            </div>

            <div
                className="flex w-full items-center justify-center"
                data-testid="register-already-registered"
            >
                <Paragraph className="mr-2">
                    {t('registration.alreadyRegistered')}
                </Paragraph>
                <Button
                    type="button"
                    onClick={handleLoginClick}
                    className="text-primary hover:text-content rounded-md font-bold focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                    data-testid="login-button"
                >
                    {t('login')}
                </Button>
            </div>
        </form>
    );
}
