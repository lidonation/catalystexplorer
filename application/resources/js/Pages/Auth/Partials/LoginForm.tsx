import Checkbox from '@/Components/atoms/Checkbox';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import SecondaryButton from '@/Components/atoms/SecondaryButton';
import TextInput from '@/Components/atoms/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import ConnectWalletIcon from '@/Components/svgs/ConnectWalletIcon';
import { useLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FormErrors {
    email?: string;
    password?: string;
}

export default function LoginForm() {
    const { data, setData, reset, processing } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const localizedRoute = useLocalizedRoute('my.dashboard');
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        axios
            .post(route('login'), {
                email: data.email,
                password: data.password,
            })
            .then(() => {
                reset('password');
                router.visit(localizedRoute);
            })
            .catch((error) => {
                setErrors(error?.response?.data?.errors);
            });
    };

    const { t } = useTranslation();
    return (
        <>
            <form onSubmit={submit} className="content-gap flex flex-col">
                <div>
                    <InputLabel htmlFor="email" value={t('email')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors?.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value={t('password')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors?.password} className="mt-2" />
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked as false)
                            }
                        />
                        <p className="text-4 text-dark ms-2">
                            {t('rememberMe')}
                        </p>
                    </div>
                    <div>
                        <Link
                            href={route('password.request')}
                            className="text-4 text-primary hover:text-content focus:border-x-border-secondary focus:ring-offset font-bold focus:ring-2 focus:outline-hidden"
                        >
                            {t('forgotPassword')}
                        </Link>
                    </div>
                </div>

                <div>
                    <PrimaryButton
                        className="flex h-10 w-full items-center justify-center rounded-md"
                        disabled={processing}
                        type="submit"
                    >
                        {t('signin')}
                    </PrimaryButton>
                </div>

                <div>
                    <SecondaryButton
                        className="flex h-10 w-full items-center justify-center rounded-md"
                        icon={<ConnectWalletIcon />}
                        iconPosition="left"
                        type="submit"
                    >
                        {t('connectWallet')}
                    </SecondaryButton>
                </div>

                <div className="flex w-full items-center justify-center">
                    <p className="text-4 mr-2">{t('registration.noAccount')}</p>
                    <Link
                        href={route('register')}
                        className="text-4 text-primary hover:text-content font-bold focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                    >
                        {t('signup')}
                    </Link>
                </div>
            </form>
        </>
    );
}
