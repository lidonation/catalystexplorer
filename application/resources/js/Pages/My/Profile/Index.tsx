import RecordsNotFound from '@/Layouts/RecordsNotFound';
import MyLayout from '@/Pages/My/MyLayout';
import ProfileSettings from '@/Pages/My/Profile/Edit';
import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import UserSection from '../Components/UserSection';
import User = App.DataTransferObjects.UserData;

const MyProfile: React.FC = () => {
    const { props } = usePage();
    const isAuthenticated = props.auth?.user;

    return (
           <>
            <Head title="My Profile" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <UserSection user={props?.auth?.user as User} />
                 </div>
                <div className="text-content text-center pt-4">
                    {isAuthenticated ? (
                        <ProfileSettings
                            auth={props.auth as never}
                            user={props.user as never}
                        />
                    ) : (
                        <RecordsNotFound />
                    )}
                </div>
        </>
    );
};

export default MyProfile;
