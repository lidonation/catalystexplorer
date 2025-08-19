import LoginIcon from '@/Components/svgs/Login';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import LoginForm from '@/Pages/Auth/Partials/LoginForm';
import RegisterForm from '@/Pages/Auth/Partials/RegisterForm';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Paragraph from '../atoms/Paragraph';
import LogOutIcon from '../svgs/LogOut';
import RegisterUserIcon from '../svgs/Register';
import UserAvatar from '../UserAvatar';
import Modal from './Modal.tsx';
import { truncateMiddle } from '@/utils/truncateMiddle.ts';

interface UserDetailsProps {
    user: App.DataTransferObjects.UserData;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    const { t } = useLaravelReactI18n();
    const [activeModal, setActiveModal] = useState<'register' | 'login' | null>(
        null,
    );
    const { isWalletConnectorOpen } = useConnectWallet();

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
            {user ? (
                <div
                    className="flex items-center justify-between"
                    data-testid="user-details"
                >
                    <div className="flex gap-3">
                        <div className="bg-background-light size-9 rounded-full">
                            <UserAvatar
                                name={user?.name}
                                imageUrl={
                                    user?.hero_img_url
                                        ? user?.hero_img_url
                                        : undefined
                                }
                                data-testid="user-avatar"
                            />
                        </div>
                        <div className="flex flex-col">
                            <Link
                                href={generateLocalizedRoute('my.dashboard')}
                                className="text-4 text-content font-semibold"
                                data-testid="user-name"
                            >
                                {truncateMiddle(user?.name)}
                            </Link>

                            <Paragraph className="text-5 text-content text-xs">
                                {user?.email}
                            </Paragraph>
                            <Link
                                href={generateLocalizedRoute('profile.edit')}
                                className="text-5 text-primary font-semibold"
                                data-testid="edit-profile-link"
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
                        date-testid="logout-button"
                    />
                </div>
            ) : (
                <>
                    <nav
                        className="flex flex-col justify-between"
                        data-testid="user-sign-in-nav"
                    >
                        <ul
                            className="menu-gap-y flex flex-1 flex-row"
                            data-testid="user-sign-in-list"
                        >
                            <li
                                className="hover:bg-background-lighter flex cursor-pointer items-center gap-1 px-2 py-1"
                                onClick={() => setActiveModal('register')}
                                data-testid="register-link"
                            >
                                <RegisterUserIcon className="text-dark" />
                                <Paragraph className="text-3">
                                    {t('register')}
                                </Paragraph>
                            </li>
                            <li
                                className="hover:bg-background-lighter flex cursor-pointer items-center gap-1 px-2 py-1"
                                onClick={() => setActiveModal('login')}
                                data-testid="login-link"
                            >
                                <LoginIcon className="text-dark" />
                                <Paragraph className="text-3">
                                    {t('login')}
                                </Paragraph>
                            </li>
                        </ul>
                    </nav>

                    {activeModal && !isWalletConnectorOpen && (
                        <Modal
                            title={
                                activeModal === 'register'
                                    ? t('register')
                                    : t('login')
                            }
                            isOpen={!!activeModal}
                            onClose={() => setActiveModal(null)}
                        >
                            {activeModal === 'register' && (
                                <RegisterForm closeModal={closeModal} />
                            )}
                            {activeModal === 'login' && (
                                <LoginForm closeModal={closeModal} />
                            )}
                        </Modal>
                    )}
                </>
            )}
        </>
    );
};

export default UserDetails;
