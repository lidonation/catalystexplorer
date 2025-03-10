import Checkbox from '@/Components/atoms/Checkbox';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import TextInput from '@/Components/atoms/TextInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import GuestLayout from '@/Layouts/GuestLayout';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect') || generateLocalizedRoute('my.dashboard');

        router.post(
            generateLocalizedRoute('login'),
            {
                email: data.email,
                password: data.password,
            },
            {
                onSuccess: () => {
                    reset('password');
                    router.visit(redirectUrl);
                },
                onError: (error) => {
                    console.log('Login error ', error);
                },
            },
        );
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {status && (
                <div className="text-4 mb-4 font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

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

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked as false)
                            }
                        />
                        <span className="text-4 text-dark ms-2">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={generateLocalizedRoute('password')}
                            className="text-4 text-dark hover:text-content focus:border-x-border-secondary focus:ring-offset rounded-md underline focus:ring-2 focus:outline-hidden"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
