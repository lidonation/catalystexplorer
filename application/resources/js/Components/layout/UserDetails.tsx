import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { route } from '../../../../vendor/tightenco/ziggy/src/js';
import LogOutIcon from '../svgs/LogOut';
import UserAvatar from '../UserAvatar';

interface UserDetailsProps {
    user: App.DataTransferObjects.UserData;
}

const UserDetails: React.FC<UserDetailsProps> = ({user}) => {
    const { t } = useTranslation();

    const logout = () => {
        axios
            .post(route('logout'))
            .then((response) => {
                router.get('/')
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex gap-3">
                <div className="size-9 rounded-full bg-background-highlight">
                    {user ? (
                        <UserAvatar imageUrl={user.profile_photo_url} />

                    ) : (
                        ''
                    )}
                </div>
                <div className="flex flex-col">
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="text-sm font-semibold text-content"
                        >
                            {user?.name}
                        </Link>
                    ) : (
                        <p className="text-sm font-semibold text-content">
                            {t('app.name')}
                        </p>
                    )}

                    <p className="text-xs text-content">
                        {user?.email || t('app.contactEmail')}
                    </p>
                    {user && (
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
                className="cursor-pointer text-dark"
                width={20}
                height={20}
                onClick={() => logout()}
            />
        </div>
    );
};

export default UserDetails;
