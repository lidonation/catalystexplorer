import RecordsNotFound from '@/Layouts/RecordsNotFound';
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

            <div className="w-full">
                <UserSection user={props?.auth?.user as User} />
            </div>
            <div className="text-content pt-4 text-center">
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
