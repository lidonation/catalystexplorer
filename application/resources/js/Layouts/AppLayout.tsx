import Button from '@/Components/atoms/Button';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import DesktopSidebar from '@/Components/layout/DesktopSidebar';
import Footer from '@/Components/layout/Footer';
import MobileNavigation from '@/Components/layout/MobileNavigation';
import ModalSidebar from '@/Components/layout/ModalSidebar';
import CloseIcon from '@/Components/svgs/CloseIcon';
import MenuIcon from '@/Components/svgs/MenuIcon';
import { Dialog } from '@headlessui/react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from './RootLayout';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <MainLayout>
            {/* Sidebar for small screens */}
            <Dialog
                id="mobile-navigation"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                className="relative z-30 sm:hidden"
                aria-label={t('navigation.mobile.sidebar')}
            >
                <MobileNavigation />
            </Dialog>

            {/* Sidebar for larger screens */}
            <DesktopSidebar />

            <section className="sm:pl-72">
                {/* Mobile header */}
                <header className="sticky top-0 z-30 border-b border-gray-200 bg-background-primary sm:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <CatalystLogo className="h-8" />
                        <Button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            ariaLabel={
                                sidebarOpen
                                    ? t('navigation.sidebar.close')
                                    : t('navigation.sidebar.open')
                            }
                            aria-expanded={sidebarOpen}
                            aria-controls="mobile-navigation"
                            className="inline-flex items-center rounded px-2 py-1 text-sm hover:bg-gray-100"
                        >
                            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                        </Button>
                    </div>
                </header>

                {/* Main content */}
                <main
                    id="main-content"
                    className="bg-background-secondary sm:mt-2 sm:rounded-tl-4xl"
                >
                    {children}
                </main>

                {/* modal sidebar */}
                <ModalSidebar title="Register" isOpen={false}>
                    <div className=""></div>
                </ModalSidebar>

                <Footer />
            </section>
        </MainLayout>
    );
}
