import { Link } from '@inertiajs/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { route } from '../../../../vendor/tightenco/ziggy/src/js';
import LogOutIcon from '../svgs/LogOut';
import User = App.DataTransferObjects.UserData;


interface UserDetailsProps {
    user: App.DataTransferObjects.UserData; 
}

const UserDetails: React.FC<UserDetailsProps> = ({user}) => {
    const { t } = useTranslation();

    const logout = () => {
        axios
            .post(route('logout'))
            .then((response) => {
                console.log(response);
                window.location.href = '/';
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex gap-3">
                <div className="size-9 rounded-full bg-gray-400">
                    {user?.name && user?.email ? (
                        <img
                            src={user.profile_photo_url}
                            alt="avatar"
                            className="size-9 rounded-full"
                        />
                    ) : (
                        ''
                    )}
                </div>
                <div className="flex flex-col">
                    {user?.name && user?.email ? (
                        <Link
                            href="/dashboard"
                            className="text-sm font-semibold text-content-primary"
                        >
                            {user?.name}
                        </Link>
                    ) : (
                        <p className="text-sm font-semibold text-content-primary">
                            {t('app.name')}
                        </p>
                    )}

                    <p className="text-xs text-content-primary">
                        {user?.email || t('app.contactEmail')}
                    </p>
                    {user?.name && user?.email && (
                        <Link
                            href="/profile"
                            className="text-xs font-semibold text-primary-100"
                        >
                            Edit profile
                        </Link>
                    )}
                </div>
            </div>
            <LogOutIcon
                className="cursor-pointer text-content-tertiary"
                width={20}
                height={20}
                onClick={() => logout()}
            />
        </div>
    );
};

export default UserDetails;
