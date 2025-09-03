import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import CatalystLogo from '../atoms/CatalystLogo';
import LangSwitcher from '../LangSwitcher';
import AppNavigation from './AppNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import UserDetails from './UserDetails';
import UserNavigation from './UserNavigation';
import User = App.DataTransferObjects.UserData;

function DesktopSidebar(props: any) {
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const { url } = usePage();
    const { ...rest } = props;
    const isOnMyRoute = url.includes('/my/');

    const currentPath =
        typeof window === 'undefined' ? null : window.location.pathname;

    if (currentPath?.includes('login') || currentPath?.includes('register')) {
        return null;
    }

    return (
        <aside
            {...rest}
            className={`flex h-full w-full flex-col ${!isOnMyRoute ? 'justify-between' : ''} gap-8`}
            aria-label={t('navigation.desktop.sidebar')}
            data-testid="desktop-sidebar-navigation"
        >
            <section className="flex h-6 shrink-0 items-center sm:pt-8">
                <CatalystLogo className="w-full" />
            </section>

            <section className="h-full overflow-y-auto">
                <section
                    className={`flex flex-col gap-6 pb-5 ${!isOnMyRoute ? 'overflow-y-auto' : ''}`}
                >
                    <AppNavigation />
                </section>

                <section className="flex flex-col gap-6">
                    <div className="px-4">
                        <div className="border-t-2 border-gray-200 pt-5">
                            <UserNavigation />
                        </div>
                    </div>

                    <div className="px-4">
                        <div className="flex flex-col gap-5 border-t-2 border-gray-200 pt-5">
                            <UserDetails user={auth?.user as unknown as User} />

                            <LangSwitcher />

                            <div className="bg-background-darker -mx-4 p-4">
                                <ThemeSwitcher />
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </aside>
    );
}

export default DesktopSidebar;
