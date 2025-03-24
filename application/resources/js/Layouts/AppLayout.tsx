import Button from '@/Components/atoms/Button';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import Breadcrumbs, { generateBreadcrumbs } from '@/Components/Breadcrumbs';
import DesktopSidebar from '@/Components/layout/DesktopSidebar';
import Footer from '@/Components/layout/Footer';
import MobileNavigation from '@/Components/layout/MobileNavigation';
import ModalSidebar from '@/Components/layout/ModalSidebar';
import PlayerBar from '@/Components/PlayerBar';
import CloseIcon from '@/Components/svgs/CloseIcon';
import MenuIcon from '@/Components/svgs/MenuIcon';
import { MetricsProvider } from '@/Context/MetricsContext';
import { PlayerProvider } from '@/Context/PlayerContext';
import { UIProvider } from '@/Context/SharedUIContext';
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';
import { Dialog } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './RootLayout';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useTranslation();
    const { url, props } = usePage();
    const breadcrumbItems = generateBreadcrumbs(url, props['locale'] as string);
    const memoizedChildren = useMemo(() => children, [children]);
    const savedTheme = localStorage.getItem('theme');
    return (
        <MainLayout>
            {/* Sidebar for small screens */}
            <Dialog
                id="mobile-navigation"
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                className="relative z-30 lg:hidden"
                aria-label={t('navigation.mobile.sidebar')}
            >
                <MobileNavigation />
            </Dialog>

            {/* Sidebar for larger screens */}
            <div className="bg-background hidden h-full lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72">
                <DesktopSidebar />
            </div>

            <section className="bg-background-lighter lg:mt-4 lg:ml-72 lg:rounded-tl-4xl">
                {/* Mobile header */}
                <header className="bg-background sticky top-0 z-30 border-b border-gray-200 lg:hidden">
                    <div className="flex h-16 items-center justify-between ">
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
                            className="text-4 inline-flex items-center rounded-sm px-2 py-1 hover:bg-gray-100"
                        >
                            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                        </Button>
                    </div>
                </header>

                {/* Main content */}
                <main id="main-content" >
                    <Breadcrumbs items={breadcrumbItems} />
                    <PlayerProvider>
                        <MetricsProvider>
                            {memoizedChildren}
                            <UIProvider>
                                <section className="sticky inset-x-0 bottom-0 mx-auto flex items-center justify-center gap-2 ">
                                    <div className="">
                                        <MetricsBar />
                                    </div>
                                    <div>
                                        <PlayerBar />
                                    </div>
                                </section>
                            </UIProvider>
                        </MetricsProvider>
                    </PlayerProvider>
                </main>

                {/* modal sidebar */}
                <ModalSidebar
                    title={t('register')}
                    isOpen={false}
                    onClose={() => setSidebarOpen(false)}
                >
                    <div className=""></div>
                </ModalSidebar>

                <footer className="">
                    <Footer />
                </footer>
            </section>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={savedTheme ?? 'light'}
            />
        </MainLayout>
    );
}
