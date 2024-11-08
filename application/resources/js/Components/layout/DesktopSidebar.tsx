import { useTranslation } from 'react-i18next';
import { usePage } from '@inertiajs/react';
import CatalystLogo from '../atoms/CatalystLogo';
import AppNavigation from './AppNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import UserDetails from './UserDetails';
import UserNavigation from './UserNavigation';


function DesktopSidebar() {
    const { t } = useTranslation();
    const {auth} = usePage().props;

    return (
        <aside
            className="hidden sm:fixed sm:inset-y-0 sm:z-30 sm:flex sm:w-72 sm:flex-col"
            aria-label={t('navigation.desktop.sidebar')}
        >
            <section className="flex grow flex-col gap-6 overflow-y-auto sm:pt-8">
                <div className="flex h-6 shrink-0 items-center px-6">
                    <CatalystLogo className="w-full" />
                </div>
                <AppNavigation />
            </section>
            <section className="flex flex-col gap-6 px-4 pb-8">
                <ThemeSwitcher />
                <UserNavigation />
                <UserDetails name={auth?.user?.name} email={auth?.user?.email} avatar={auth?.avatar}/>
            </section>
        </aside>
    );
}

export default DesktopSidebar;
