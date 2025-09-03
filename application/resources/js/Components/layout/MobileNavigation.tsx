import { DialogPanel } from '@headlessui/react';
import { router, usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { useEffect, useState } from 'react';
import AppNavigation from './AppNavigation';
import ThemeSwitcher from './ThemeSwitcher';
import UserDetails from './UserDetails';
import UserNavigation from './UserNavigation';
import User = App.DataTransferObjects.UserData;

function MobileNavigation() {
    const { t } = useLaravelReactI18n();
    const { auth } = usePage().props;
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const handleFinish = () => setIsOpen(false);
        return router.on('finish', handleFinish);
    }, []);

    return (
        isOpen && (
            <div className="fixed inset-0 top-16 flex">
                <DialogPanel
                    transition
                    className="bg-background relative flex w-full flex-1 transform overflow-y-auto transition duration-300 ease-in-out data-closed:-translate-x-full"
                >
                    <aside
                        className="flex grow flex-col justify-between px-4"
                        aria-label={t('navigation.mobile.content')}
                        data-testid="mobile-navigation-content"
                    >
                        <section>
                            <AppNavigation />
                        </section>
                        <section className="mt-4 flex flex-col gap-6 px-4 pb-8">
                            <ThemeSwitcher />
                            <UserNavigation />
                            <UserDetails user={auth?.user as unknown as User} />
                        </section>
                    </aside>
                </DialogPanel>
            </div>
        )
    );
}

export default MobileNavigation;
