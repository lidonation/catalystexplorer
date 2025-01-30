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
            className="flex h-full flex-col justify-between"
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
                    <div className="border-border border-t pt-6">
                        <UserNavigation/>
                    </div>
                </div>

                <div className="border-border flex flex-col gap-6 border-t pt-6">
                    <div className="px-4">
                        <UserDetails user={auth?.user as User}/>
                    </div>
                    <div className="bg-background-darker px-4 py-4">
                        <ThemeSwitcher/>
                    </div>
                </div>
            </section>
        </aside>
    );
}

export default DesktopSidebar;
