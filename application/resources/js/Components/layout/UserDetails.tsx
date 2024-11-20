import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { route } from '../../../../vendor/tightenco/ziggy/src/js';
import LogOutIcon from '../svgs/LogOut';
import LoginIcon from '../svgs/Login';
import RegisterUserIcon from '../svgs/Register';
import UserAvatar from '../UserAvatar';
import ModalSidebar from './ModalSidebar';
import RegisterForm from '@/Pages/Auth/Partials/RegisterForm';

interface UserDetailsProps {
    user: App.DataTransferObjects.UserData;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        <>
            {user ?
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="size-9 rounded-full bg-background-light">
                            <UserAvatar imageUrl={user.profile_photo_url} />
                        </div>
                        <div className="flex flex-col">
                            <Link
                                href="/dashboard"
                                className="text-4 font-semibold text-content"
                            >
                                {user?.name}
                            </Link>

                            <p className="text-5 text-content">
                                {user?.email}
                            </p>
                            <Link
                                href="/profile"
                                className="text-5 font-semibold text-primary"
                            >
                                {t("userDetails.editProfile")}
                            </Link>
                        </div>
                    </div>
                    <LogOutIcon
                        className="cursor-pointer text-dark hover:text-hover"
                        width={20}
                        height={20}
                        onClick={() => logout()}
                    />
                    <div>
                    </div>
                </div>
                :
                <>

                    <nav className="flex flex-col justify-between">
                        <ul className="flex flex-1 flex-col menu-gap-y">
                            <li className='flex items-center gap-3 px-3 py-1 hover:bg-background-lighter cursor-pointer' onClick={() => setIsModalOpen(true)}>
                                <RegisterUserIcon className='text-dark' />
                                <p className='text-3'>{t("userDetails.register")}</p>
                            </li>
                            <li className='flex items-center gap-3 px-3 py-1 hover:bg-background-lighter cursor-pointer'>
                                <LoginIcon className='text-dark' />
                                <p className='text-3'>{t("userDetails.login")}</p>
                            </li>
                        </ul>
                    </nav>
                    <ModalSidebar
                        title="Register"
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    >
                        <RegisterForm />
                    </ModalSidebar>
                </>
            }

        </>
    );
};

export default UserDetails;
