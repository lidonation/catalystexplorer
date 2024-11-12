import {usePage} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import CatalystLogo from '../atoms/CatalystLogo';
import AppNavigation from './AppNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import UserDetails from './UserDetails';
import UserNavigation from './UserNavigation';
import User = App.DataTransferObjects.UserData;

function DesktopSidebar() {
    const {t} = useTranslation();
    const {auth} = usePage().props;

    return (
        <aside
            className="hidden sm:fixed sm:inset-y-0 sm:z-30 sm:flex sm:w-72 sm:flex-col"
            aria-label={t('navigation.desktop.sidebar')}
        >
            <section className="flex grow flex-col gap-6 overflow-y-auto sm:pt-8">
                <div className="flex h-6 shrink-0 items-center px-6">
                    <CatalystLogo className="w-full"/>
                </div>
                <AppNavigation/>
            </section>
            <section className="flex flex-col gap-6">
                <div className="px-4">
                    <div className="border-t border-border-primary pt-6">
                        <UserNavigation/>
                    </div>
                </div>

                <div className="flex flex-col gap-6 border-t border-border-primary pt-6">
                    <div className="px-4">
                        <UserDetails user={auth?.user as User}/>
                    </div>
                    <div className="py-4 px-4 bg-background-primary-darker">
                        <ThemeSwitcher/>
                    </div>
                </div>
            </section>
        </aside>
    );
}

export default DesktopSidebar;
