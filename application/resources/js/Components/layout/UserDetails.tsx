import LoginIcon from '@/Components/svgs/Login';
import LoginForm from '@/Pages/Auth/Partials/LoginForm';
import RegisterForm from '@/Pages/Auth/Partials/RegisterForm';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogOutIcon from '../svgs/LogOut';
import RegisterUserIcon from '../svgs/Register';
import UserAvatar from '../UserAvatar';
import ModalSidebar from './ModalSidebar';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import Paragraph from '../atoms/Paragraph';

interface UserDetailsProps {
    user: App.DataTransferObjects.UserData;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState<'register' | 'login' | null>(
        null,
    );
    const {isWalletConnectorOpen } = useConnectWallet()

    const logout = () => {
        router.post(
            generateLocalizedRoute('logout'),
            {},
            {
                onSuccess: () => {
                    router.get('/');
                },
                onError: (error) => {
                    console.log('Logout error ', error);
                },
            },
        );
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    return (
        <>
            {user ?
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="bg-background-light size-9 rounded-full">
                            <UserAvatar imageUrl={user.hero_img_url} />
                        </div>
                        <div className="flex flex-col">
                            <Link
                                href={generateLocalizedRoute('my.dashboard')}
                                className="text-4 text-content font-semibold"
                            >
                                {user?.name}
                            </Link>

                            <Paragraph className="text-5 text-content text-xs">{user?.email}</Paragraph>
                            <Link
                                href={generateLocalizedRoute('profile.edit')}
                                className="text-5 text-primary font-semibold"
                            >
                                {t('users.editProfile')}
                            </Link>
                        </div>
                    </div>
                    <LogOutIcon
                        className="text-dark hover:text-hover cursor-pointer"
                        width={20}
                        height={20}
                        onClick={() => logout()}
                    />
                </div>
                :
                <>
                    <nav className="flex flex-col justify-between">
                        <ul className="menu-gap-y flex flex-1 flex-row">
                            <li className='flex items-center gap-1 px-2 py-1 hover:bg-background-lighter cursor-pointer' onClick={() => setActiveModal("register")}>
                                <RegisterUserIcon className="text-dark" />
                                <Paragraph className="text-3">{t('register')}</Paragraph>
                            </li>
                            <li className='flex items-center gap-1 px-2 py-1 hover:bg-background-lighter cursor-pointer' onClick={() => setActiveModal("login")}>
                                <LoginIcon className="text-dark" />
                                <Paragraph className="text-3">{t('login')}</Paragraph>
                            </li>
                        </ul>
                    </nav>

                    {activeModal && !isWalletConnectorOpen && (
                        <ModalSidebar
                            title={
                                activeModal === 'register'
                                    ? t('register')
                                    : t('login')
                            }
                            isOpen={!!activeModal}
                            onClose={() => setActiveModal(null)}
                        >
                            {activeModal === 'register' && <RegisterForm closeModal={closeModal} />}
                            {activeModal === 'login' && <LoginForm closeModal={closeModal} />}
                        </ModalSidebar>
                    )}
                </>
            }

        </>
    );
};

export default UserDetails;
