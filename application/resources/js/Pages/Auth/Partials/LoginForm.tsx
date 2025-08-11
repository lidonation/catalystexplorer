import Button from '@/Components/atoms/Button';
import Checkbox from '@/Components/atoms/Checkbox';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import ConnectWalletButton from '@/Components/ConnectWalletButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

interface FormErrors {
    email?: string;
    password?: string;
}

interface LoginFormProps {
    closeModal?: () => void;
}

export default function LoginForm({ closeModal }: LoginFormProps) {
    const { data, setData, reset, processing } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect: window.location.href

    });

    const [errors, setErrors] = useState<FormErrors>({});

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        router.post(
            generateLocalizedRoute('login'),
            {
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    reset('password');
                },
                onError: (serverErrors) => {
                    console.log('Login error ', serverErrors);
                    setErrors(serverErrors);
                },
            },
        );
    };

    const { t } = useLaravelReactI18n();

    const handleForgotPassword = () => {
        if (closeModal) closeModal();
        router.get(generateLocalizedRoute('password.request'));
    };

    const handleRegister = () => {
        if(closeModal) closeModal();
        router.get(generateLocalizedRoute('register'));
    }

    return (
        <>
            <form onSubmit={submit} className="content-gap flex flex-col w-full p-4" data-testid="login-form">
                <div>
                    <InputLabel htmlFor="email" value={t('email')} data-testid="email-input-label"/>

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        data-testid="email-input"
                    />

                    <InputError message={errors?.email} className="mt-2" data-testid="email-error-text"/>
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('password')} data-testid="password-input-label"/>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        data-testid="password-input"
                    />

                    <InputError message={errors?.password} className="mt-2" data-testid="password-error-text"/>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center">
                    <Checkbox
                    name="remember"
                    label={t('rememberMe')}
                    checked={data.remember}
                    onChange={(e) =>
                    setData('remember', e.target.checked as false)
                     }
                    data-testid="remember-me-checkbox"
                    />
                    </div>
                    <div>
                        <Button
                            type="button"
                            onClick={handleForgotPassword}
                            className="text-4 text-primary hover:text-content focus:border-x-border-secondary focus:ring-offset font-bold focus:ring-2 focus:outline-hidden"
                            data-testid="forgot-password-button"
                        >
                            {t('forgotPassword')}
                        </Button>
                    </div>
                </div>

                <div>
                    <PrimaryButton
                        className="flex h-10 w-full items-center justify-center rounded-md"
                        disabled={processing}
                        type="submit"
                        data-testid="login-submit-button"
                    >
                        {t('signin')}
                    </PrimaryButton>
                </div>

                <div>
                    <ConnectWalletButton />
                </div>

                <div className="flex w-full items-center justify-center" data-testid="login-no-account">
                    <Paragraph className="text-4 mr-2">{t('registration.noAccount')}</Paragraph>
                    <Button
                        type="button"
                        onClick={handleRegister}
                        className="text-4 text-primary hover:text-content font-bold focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                        data-testid="register-button"
                    >
                        {t('signup')}
                    </Button>
                </div>
            </form>
        </>
    );
}
