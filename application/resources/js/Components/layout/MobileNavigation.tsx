import { DialogPanel } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import AppNavigation from './AppNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import UserDetails from './UserDetails';
import UserNavigation from './UserNavigation';
import { usePage } from '@inertiajs/react';

function MobileNavigation() {
    const { t } = useTranslation();
    const {auth} = usePage().props;

    return (
        <div className="fixed inset-0 top-16 flex">
            <DialogPanel
                transition
                className="relative flex w-full flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
            >
                <aside
                    className="flex grow flex-col justify-between bg-background-primary px-4"
                    aria-label={t('navigation.mobile.content')}
                >
                    <section>
                        <AppNavigation />
                    </section>
                    <section className="flex flex-col gap-6 px-4 pb-8">
                        <ThemeSwitcher />
                        <UserNavigation />
                        <UserDetails name={auth?.user?.name} email={auth?.user?.email}/>
                    </section>
                </aside>
            </DialogPanel>
        </div>
    );
}

export default MobileNavigation;
