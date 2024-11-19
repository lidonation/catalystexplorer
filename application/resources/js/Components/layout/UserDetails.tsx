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
import RegisterForm from '../Auth/RegisterForm';

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
                                Edit profile
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
                    <div className='flex flex-col menu-gap-x'>
                        <div className='flex menu-gap-y px-3 py-1 hover:bg-background-lighter hover:text-content-secondary cursor-pointer' onClick={() => setIsModalOpen(true)}>
                            <RegisterUserIcon className='text-dark' />
                            <p className='text-2 font-medium'>Register</p>
                        </div>
                        <div className='flex menu-gap-y px-3 py-1 hover:bg-background-lighter hover:text-content-secondary cursor-pointer'>
                            <LoginIcon className='text-dark' />
                            <p className='text-2 font-medium'>Login</p>
                        </div>
                    </div>
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
