import AuthLayout from '@/Components/layout/AuthLayout';
import { Head } from '@inertiajs/react';
import LoginForm from './Partials/LoginForm';

export default function Login({
    status,
    canResetPassword,
    intendedUrl,
}: {
    status?: string;
    canResetPassword: boolean;
    intendedUrl?: string;
}) {
    return (
        <div>
            <Head title="Log in" />
            <AuthLayout title="Log in">
                <LoginForm intendedUrl={intendedUrl} />
            </AuthLayout>
        </div>
    );
}
