import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import ProfileSettings from '@/Pages/My/Profile/Edit';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';

const MyProfile: React.FC = () => {
    const { props } = usePage();
    const isAuthenticated = props.auth?.user;

    return (
        <MyLayout>
            <Head title="My Profile" />

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
                </div>
            </div>
        </MyLayout>
    );
};

export default MyProfile;
