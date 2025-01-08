import { Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import LogOutIcon from '../svgs/LogOut';
import LoginIcon from '../svgs/Login';
import RegisterUserIcon from '../svgs/Register';
import UserAvatar from '../UserAvatar';
import ModalSidebar from './ModalSidebar';
import RegisterForm from '@/Pages/Auth/Partials/RegisterForm';
import LoginForm from '@/Pages/Auth/Partials/LoginForm';
import {useLocalizedRoute} from "@/utils/localizedRoute";

interface UserDetailsProps {
    user: App.DataTransferObjects.UserData;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user }) => {
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState<"register" | "login" | null>(null);

    const logout = () => {
        axios
            .post('logout')
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
                                href={useLocalizedRoute('dashboard')}
                                className="text-4 font-semibold text-content"
                            >
                                {user?.name}
                            </Link>

                            <p className="text-5 text-content">
                                {user?.email}
                            </p>
                            <Link
                                href={route('profile.edit')}
                                className="text-5 font-semibold text-primary"
                            >
                                {t("users.editProfile")}
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
                        <ul className="flex flex-1 flex-row menu-gap-y">
                            <li className='flex items-center gap-1 px-2 py-1 hover:bg-background-lighter cursor-pointer' onClick={() => setActiveModal("register")}>
                                <RegisterUserIcon className='text-dark' />
                                <p className='text-3'>{t("register")}</p>
                            </li>
                            <li className='flex items-center gap-1 px-2 py-1 hover:bg-background-lighter cursor-pointer' onClick={() => setActiveModal("login")}>
                                <LoginIcon className='text-dark' />
                                <p className='text-3'>{t("login")}</p>
                            </li>
                        </ul>
                    </nav>

                    {activeModal && (
                        <ModalSidebar
                            title={activeModal === "register" ? t("register") : t("login")}
                            isOpen={!!activeModal}
                            onClose={() => setActiveModal(null)}
                        >
                            {activeModal === "register" && <RegisterForm />}
                            {activeModal === "login" && <LoginForm />}
                        </ModalSidebar>
                    )}
                </>
            }

        </>
    );
};

export default UserDetails;
