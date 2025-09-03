import AuthLayout from '@/Components/layout/AuthLayout';
import { Head } from '@inertiajs/react';
import RegisterForm from './Partials/RegisterForm';

export default function Register({}: { status?: string }) {
    return (
        <div>
            <Head title="Register" />
            <AuthLayout title="Register">
                <RegisterForm />
            </AuthLayout>
        </div>
    );
}
