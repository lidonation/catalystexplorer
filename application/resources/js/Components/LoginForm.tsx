import Checkbox from '@/Components/atoms/Checkbox';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import SecondaryButton from '@/Components/atoms/SecondaryButton';
import TextInput from '@/Components/atoms/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ConnectWalletIcon from '@/Components/svgs/ConnectWalletIcon';
import { Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    

    const { data, setData, reset, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        axios
            .post(postRoute ?? generateLocalizedRoute('login'), {
                email: data.email,
                password: data.password,
            })
            .then((response) => {
                reset('password');
                router.reload();
            })
            .catch((error) => {
                setErrors(error?.response?.data?.errors);
            });
    };

    return (
        <div className="not-prose flex items-center justify-center py-12">
            <div className="bg-background border-gray-200 border mx-4 w-full max-w-md rounded-2xl p-6 shadow-md sm:mx-0 sm:p-8">
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

                <form onSubmit={submit}>
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
                            />
                            <label htmlFor="remember-me" className="text-sm">
                                {t('rememberMe')}
                            </label>
                        </div>
                        <Link
                            href="#"
                            className="text-primary text-xs hover:underline sm:text-sm"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>

                    <PrimaryButton
                        className="w-full py-3"
                        disabled={processing}
                        type="submit"
                    >
                        {t('signin')}
                    </PrimaryButton>
                </form>

                <p className="text-dark mt-4 text-center text-xs sm:text-sm">
                    {t('registration.noAccount')}{' '}
                    <Link
                        href="#"
                        className="text-primary font-medium hover:underline"
                    >
                        {t('signup')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
