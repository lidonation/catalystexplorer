import { Head } from '@inertiajs/react';
import LoginForm from './Partials/LoginForm';
import AuthLayout from '@/Components/layout/AuthLayout';

export default function Login({}: {
    status?: string;
    canResetPassword: boolean;
}) {
    return (
        <div>
            <Head title="Log in" />
            <AuthLayout title="Log in">
                <LoginForm />
            </AuthLayout>
        </div>
    );
}
