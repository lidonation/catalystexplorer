import RecordsNotFound from '@/Layouts/RecordsNotFound';
import ProfileSettings from '@/Pages/My/Profile/Edit';
import { Head, usePage } from '@inertiajs/react';
import React, { useRef } from 'react';
import UserSection from '../Components/UserSection';
import User = App.DataTransferObjects.UserData;

const MyProfile: React.FC = () => {
    const { props } = usePage();
    const isAuthenticated = props.auth?.user;
    const profileSettingsRef = useRef<{ openCityModal: () => void } | null>(null);

    const handleAddCity = () => {
        profileSettingsRef.current?.openCityModal();
    };

    const userData = (props.user as User) || (props.auth?.user as User);

    return (
        <>
            <Head title="My Profile" />

            <div className="w-full">
                <UserSection user={userData} onAddCity={handleAddCity} />
            </div>
            <div className="text-content pt-4 text-center">
                {isAuthenticated ? (
                    <ProfileSettings
                        ref={profileSettingsRef}
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
