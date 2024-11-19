import {usePage} from '@inertiajs/react';
import {useTranslation} from 'react-i18next';
import CatalystLogo from '../atoms/CatalystLogo';
import AppNavigation from './AppNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import UserDetails from './UserDetails';
import UserNavigation from './UserNavigation';
import User = App.DataTransferObjects.UserData;

function DesktopSidebar(props: any) {
    const {t} = useTranslation();
    const {auth} = usePage().props;
    const {...rest} = props;
    return (
        <aside
            {...rest}
            className="justify-between flex flex-col h-full"
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
                    <div className="border-t border-border pt-6">
                        <UserNavigation/>
                    </div>
                </div>

                <div className="flex flex-col gap-6 border-t border-border pt-6">
                    <div className="px-4">
                        <UserDetails user={auth?.user as User}/>
                    </div>
                    <div className="py-4 px-4 bg-background-darker">
                        <ThemeSwitcher/>
                    </div>
                </div>
            </section>
        </aside>
    );
}

export default DesktopSidebar;
