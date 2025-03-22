import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import ProfileSettings from '@/Pages/My/Profile/Edit';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
<<<<<<< HEAD
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import MyLayout from "@/Pages/My/MyLayout";
import RecordsNotFound from '@/Layouts/RecordsNotFound';
=======
>>>>>>> origin/dev

const MyProfile: React.FC = () => {
    const { props } = usePage();
    const isAuthenticated = props.auth?.user;

    return (
        <MyLayout>
            <Head title="My Profile" />

<<<<<<< HEAD
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-content">
                    <RecordsNotFound />
=======
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-content text-center">
                    {isAuthenticated ? (
                        <ProfileSettings
                            auth={props.auth as never}
                            user={props.user as never}
                        />
                    ) : (
                        <RecordsNotFound />
                    )}
>>>>>>> origin/dev
                </div>
            </div>
        </MyLayout>
    );
};

export default MyProfile;
