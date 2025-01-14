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
import { PlayerProvider } from '@/Context/PlayerContext';
import { UIProvider } from '@/Context/SharedUIContext';
import { Dialog } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from './RootLayout';
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useTranslation();
    const { url, props } = usePage();
    const breadcrumbItems = generateBreadcrumbs(url, props['locale'] as string);

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
            <div className="hidden h-full bg-background lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72">
                <DesktopSidebar />
            </div>

            <section className="bg-background-lighter lg:ml-72 lg:mt-4 lg:rounded-tl-4xl">
                {/* Mobile header */}
                <header className="sticky top-0 z-30 border-b border-gray-200 bg-background lg:hidden">
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
                            className="text-4 inline-flex items-center rounded px-2 py-1 hover:bg-gray-100"
                        >
                            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                        </Button>
                    </div>
                </header>

                {/* Main content */}
                <main id="main-content">
                    <Breadcrumbs items={breadcrumbItems} />
                    <PlayerProvider>
                        {children}

                        <UIProvider>
                            <section className="sticky inset-x-0 bottom-0 mx-auto flex items-center justify-center gap-2 pb-4">
                                <div className="">
                                    <MetricsBar  />
                                </div>
                                <div>
                                    <PlayerBar />
                                </div>
                            </section>
                        </UIProvider>
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

                <footer className="section-margin">
                    <Footer />
                </footer>
            </section>
        </MainLayout>
    );
}
