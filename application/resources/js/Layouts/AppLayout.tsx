import Button from '@/Components/atoms/Button';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import Breadcrumbs, { generateBreadcrumbs } from '@/Components/Breadcrumbs';
import GlobalBanner from '@/Components/GlobalBanner';
import GraphButton from '@/Components/GraphButton';
import DesktopSidebar from '@/Components/layout/DesktopSidebar';
import Footer from '@/Components/layout/Footer';
import MobileNavigation from '@/Components/layout/MobileNavigation';
import Modal from '@/Components/layout/Modal.tsx';
import CloseIcon from '@/Components/svgs/CloseIcon';
import MenuIcon from '@/Components/svgs/MenuIcon';
import GlobalErrorProvider from '@/Components/GlobalErrorProvider';
import { MetricsProvider } from '@/Context/MetricsContext';
import { GlobalSearchProvider } from '@/Context/GlobalSearchContext';
import { PlayerProvider } from '@/Context/PlayerContext';
import { UIProvider } from '@/Context/SharedUIContext';
import ProposalComparison from '@/Pages/Proposals/Comparison/ProposalComparison';
import { Dialog } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode, useMemo, useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from './RootLayout';
import GlobalSearchModal from '@/Components/GlobalSearch/GlobalSearchModal';
import GlobalSearchTrigger from '@/Components/GlobalSearch/GlobalSearchTrigger';
import ContentHeader from '@/Components/layout/ContentHeader';
// @ts-ignore
import MetricsBar from '@/Pages/Proposals/Partials/MetricsBar';
import { ModalRoot } from '@inertiaui/modal-react';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t, currentLocale } = useLaravelReactI18n();
    const { url, props } = usePage();
    const [currentUrl, setCurrentUrl] = useState(url);
    const breadcrumbItems = generateBreadcrumbs(currentUrl, props['locale'] as string);
    const memoizedChildren = useMemo(() => children, [children]);
    const savedTheme =
        typeof window === 'undefined' ? null : localStorage.getItem('theme');

    // RTL languages
    const RTL_LANGS = ['ar'];
    const isRTL = RTL_LANGS.includes(currentLocale());
    const [showMetricsBar, setShowMetricsBar] = useState(true);

    // Update document direction when locale changes
    useEffect(() => {
        const locale = currentLocale();
        document.documentElement.dir = RTL_LANGS.includes(locale) ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
    }, [currentLocale()]);

    useEffect(() => {
        const handleUrlChange = () => {
            setCurrentUrl(window.location.pathname);
        };

        window.addEventListener('popstate', handleUrlChange);

        window.addEventListener('urlchange', handleUrlChange);

        return () => {
            window.removeEventListener('popstate', handleUrlChange);
            window.removeEventListener('urlchange', handleUrlChange);
        };
    }, []);

    useEffect(() => {
        setCurrentUrl(url);
    }, [url]);

    const isAuthPage = url.includes('login') || url.includes('register');


    return (
        <MainLayout>
            <GlobalBanner />
            <GlobalErrorProvider>
                <GlobalSearchProvider>
                    {/* Sidebar for small screens */}
                    <Dialog
                        id="mobile-navigation"
                        open={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        className="relative z-50 lg:hidden"
                        aria-label={t('navigation.mobile.sidebar')}
                        data-testid="mobile-navigation-dialog"
                    >
                        <MobileNavigation />
                    </Dialog>

                    {!isAuthPage && (
                        <div className="bg-background hidden h-full lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-(--sidebar-width)">
                            <DesktopSidebar />
                        </div>
                    )}

                    <section
                        className={`bg-background-lighter lg:mt-4 ${isAuthPage ? '' : 'lg:ml-(--sidebar-width) rtl:ml-0 rtl:mr-(--sidebar-width)'} ${isAuthPage ? '' : 'lg:rounded-tl-4xl'}`}
                    >
                        {/* Mobile header */}
                        <header
                            className="bg-background sticky top-0 z-30 border-b border-gray-200 lg:hidden"
                            data-testid="mobile-header"
                        >
                            <div className="flex h-16 items-center justify-between">
                                <CatalystLogo className="h-8" />
                                <div className="flex items-center gap-2">
                                    <GlobalSearchTrigger variant="minimal" />
                                    <Button
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        ariaLabel={
                                            sidebarOpen
                                                ? t('navigation.sidebar.close')
                                                : t('navigation.sidebar.open')
                                        }
                                        ariaExpanded={sidebarOpen}
                                        ariaControls="mobile-navigation"
                                        className="text-4 inline-flex items-center rounded-sm px-2 py-1 hover:bg-gray-100"
                                        dataTestId="mobile-navigation-toggle-button"
                                    >
                                        {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                                    </Button>
                                </div>
                            </div>
                        </header>

                        {/* Main content */}
                        <main
                            id="main-content"
                            data-testid="main-content"
                            className=""
                        >



                            <Breadcrumbs items={breadcrumbItems} />

                            <div className="hidden lg:flex lg:justify-center">
                                <ContentHeader />
                            </div>

                            <PlayerProvider>
                                <MetricsProvider>
                                    {memoizedChildren}

                                    {/* <UIProvider>
                                <div className=" z-40">
                                    <GraphButton 
                                        onAnalyticsClick={toggleMetricsBar}
                                        showMetricsBar={showMetricsBar}
                                    />
                                </div>
                                {showMetricsBar && (
                                    <MetricsBar />
                                )}
                            </UIProvider> */}
                                </MetricsProvider>
                            </PlayerProvider>
                        </main>

                        <ProposalComparison />
                        <Modal
                            title={t('register')}
                            isOpen={false}
                            onClose={() => setSidebarOpen(false)}
                        >
                            <div className=""></div>
                        </Modal>

                        <footer className="">
                            <Footer />
                        </footer>
                    </section>

                    <GlobalSearchModal />

                    <ToastContainer
                        position={isRTL ? "top-left" : "top-right"}
                        autoClose={5000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={isRTL}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme={savedTheme ?? 'light'}
                    />

                    <ModalRoot />
                </GlobalSearchProvider>
            </GlobalErrorProvider>
        </MainLayout>
    );
}
