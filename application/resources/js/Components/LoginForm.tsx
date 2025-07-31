import Checkbox from '@/Components/atoms/Checkbox';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Title from './atoms/Title';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import ConnectWalletButton from './ConnectWalletButton';

interface LoginFormProps {
    title?: string;
    postRoute?:string
}

interface FormErrors {
    email?: string;
    password?: string;
}

export default function LoginForm({ title, postRoute }: LoginFormProps) {
    const { t } = useLaravelReactI18n();

    const { data, setData, reset, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router
            .post(postRoute ?? generateLocalizedRoute('login'), {
                email: data.email,
                password: data.password,
            },{
                onSuccess:()=> reset('password'),
                onError:(errors)=> setErrors(errors)
            })
    };

    return (
        <div className="not-prose flex items-center justify-center py-12">
            <div className="bg-background  mx-4 w-full max-w-md rounded-2xl p-6  sm:mx-0 sm:p-8">
                {/* Conditionally render the title only if it's provided */}
                {title && (
                    <Title
                        level="2"
                        className="text-center text-2xl sm:text-3xl"
                    >
                        {title}
                    </Title>
                )}

                <div className="mt-2 text-center">
                    <p className="text-xs sm:text-sm">{t('loginPrompt')}</p>
                </div>

                <div className="mt-4 flex justify-center">
                    <ConnectWalletButton/>
                </div>

                <div className="py-4"></div>

                <form onSubmit={submit} data-testid="login-form">
                    <div className="mb-4">
                        <InputLabel htmlFor="email">
                            {t('emailAddress')}
                        </InputLabel>
                        <TextInput
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="mt-1 w-full"
                            value={data.email}
                            required
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            data-testid="login-email-input"
                        />
                        <InputError message={errors?.email} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="password">
                            {t('password')}
                        </InputLabel>
                        <TextInput
                            id="password"
                            type="password"
                            placeholder="Password"
                            className="mt-1 w-full"
                            required
                            autoComplete="current-password"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            value={data.password}
                            data-testid="login-password-input"
                        />
                        <InputError
                            message={errors?.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember-me"
                                className="text-primary h-4 w-4 rounded"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData(
                                        'remember',
                                        e.target.checked as false,
                                    )
                                }
                                data-testid="login-remember-checkbox"
                            />
                            <label htmlFor="remember-me" className="text-sm">
                                {t('rememberMe')}
                            </label>
                        </div>
                        <Link
                            href="#"
                            className="text-primary text-xs hover:underline sm:text-sm"
                            data-testid="login-forgot-password-link"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    <PrimaryButton
                        className="w-full py-3"
                        disabled={processing}
                        type="submit"
                        data-testid="login-signin-button"
                    >
                        {t('signin')}
                    </PrimaryButton>
                </form>

                <p className="text-dark mt-4 text-center text-xs sm:text-sm">
                    {t('registration.noAccount')}{' '}
                    <Link
                        href="#"
                        className="text-primary font-medium hover:underline"
                        data-testid="login-signup-link"
                    >
                        {t('signup')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
