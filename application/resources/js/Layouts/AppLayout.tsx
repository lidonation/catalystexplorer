import CatalystLogo from '@/Components/atoms/CatalystLogo';
import AppNavigation from '@/Components/layout/AppNavigation';
import Footer from '@/Components/layout/Footer';
import ModalSidebar from '@/Components/layout/ModalSidebar';
import ThemeSwitcher from '@/Components/layout/ThemeSwitcher';
import UserDetails from '@/Components/layout/UserDetails';
import UserNavigation from '@/Components/layout/UserNavigation';
import CloseIcon from '@/Components/svgs/CloseIcon';
import MenuIcon from '@/Components/svgs/MenuIcon';
import { Dialog, DialogPanel } from '@headlessui/react';
import { ReactNode, useState } from 'react';
import MainLayout from './RootLayout';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <MainLayout>
            {/* Sidebar for small screens */}
            <Dialog
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                className="relative z-30 sm:hidden"
                aria-labelledby="mobile-navigation"
            >
                <div className="fixed inset-0 top-16 flex">
                    <DialogPanel
                        transition
                        className="relative flex w-full flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                    >
                        <aside
                            className="flex grow flex-col justify-between bg-background-primary px-4"
                            aria-label="Mobile Navigation"
                        >
                            <section>
                                <AppNavigation />
                            </section>
                            <section className="flex flex-col gap-6 px-4 pb-8">
                                <ThemeSwitcher />
                                <UserNavigation />
                                <UserDetails />
                            </section>
                        </aside>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Sidebar for larger screens */}
            <aside
                className="hidden sm:fixed sm:inset-y-0 sm:z-30 sm:flex sm:w-72 sm:flex-col"
                aria-label="Sidebar Navigation"
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
                    <UserDetails />
                </section>
            </aside>

            <section className="sm:pl-72">
                {/* Mobile header */}
                <header className="sticky top-0 z-30 border-b border-gray-200 bg-background-primary sm:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <CatalystLogo className="h-8" />
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="inline-flex items-center rounded px-1 text-sm hover:bg-gray-100"
                            aria-label={
                                sidebarOpen ? 'Close sidebar' : 'Open sidebar'
                            }
                            aria-expanded={sidebarOpen}
                            aria-controls="mobile-navigation"
                        >
                            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <main
                    id="main-content"
                    className="bg-background-secondary sm:mt-2 sm:rounded-tl-4xl"
                    aria-describedby="main-content-section"
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
