import CatalystLogo from '@/Components/atoms/CatalystLogo';
import NavLinkItem from '@/Components/atoms/NavLinkItem';
import ModalSidebar from '@/Components/layout/ModalSidebar';
import CheckIcon from '@/Components/svgs/CheckIcon';
import CloseIcon from '@/Components/svgs/CloseIcon';
import HomeIcon from '@/Components/svgs/HomeIcon';
import MenuIcon from '@/Components/svgs/MenuIcon';
import NoteIcon from '@/Components/svgs/NoteIcon';
import { ThemeProvider } from '@/Context/ThemeContext';
import { Dialog, DialogPanel } from '@headlessui/react';
import { ReactNode, useState } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <>
            {/* Sidebar for small screens */}
            <Dialog
                open={sidebarOpen}
                onClose={setSidebarOpen}
                className="relative z-30 sm:hidden"
            >
                <div className="fixed inset-0 top-16 flex">
                    <DialogPanel
                        transition
                        className="relative flex w-full flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                    >
                        <aside className="bg-background-primary flex grow flex-col overflow-y-auto">
                            <nav aria-label="Mobile Navigation">
                                <ul className="flex flex-1 flex-col space-y-2 px-4">
                                    <li>
                                        <NavLinkItem href="/" title="Home">
                                            <HomeIcon color="#667085" />
                                        </NavLinkItem>
                                    </li>
                                    <li>
                                        <NavLinkItem
                                            href="/proposals"
                                            active
                                            title="Proposals"
                                        >
                                            <NoteIcon color="#2596BE" />
                                        </NavLinkItem>
                                    </li>
                                    <li>
                                        <NavLinkItem
                                            href="/funds"
                                            title="Funds"
                                        >
                                            <CheckIcon color="#667085" />
                                        </NavLinkItem>
                                    </li>
                                </ul>
                            </nav>
                        </aside>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Sidebar for larger screens */}
            <aside className="hidden sm:fixed sm:inset-y-0 sm:z-30 sm:flex sm:w-72 sm:flex-col">
                <div className="flex grow flex-col gap-6 overflow-y-auto sm:pt-8">
                    <div className="flex h-6 shrink-0 items-center px-6">
                        <CatalystLogo className="w-full" />
                    </div>
                    <nav aria-label="Sidebar Navigation">
                        <ul className="flex flex-1 flex-col space-y-2 px-4">
                            <li>
                                <NavLinkItem href="/" title="Home">
                                    <HomeIcon color="#667085" />
                                </NavLinkItem>
                            </li>
                            <li>
                                <NavLinkItem
                                    href="/proposals"
                                    active
                                    title="Proposals"
                                >
                                    <NoteIcon color="#2596BE" />
                                </NavLinkItem>
                            </li>
                            <li>
                                <NavLinkItem href="/funds" title="Funds">
                                    <CheckIcon color="#667085" />
                                </NavLinkItem>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>

            {/* Main content area */}
            <div className="sm:pl-72">
                {/* Mobile header */}
                <header className="bg-background-primary sticky top-0 z-30 border-b border-gray-200 sm:hidden">
                    <div className="flex h-16 items-center justify-between px-4">
                        <CatalystLogo className="h-8" />
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="inline-flex items-center rounded px-1 text-sm hover:bg-gray-100"
                            aria-label={
                                sidebarOpen ? 'Close sidebar' : 'Open sidebar'
                            }
                        >
                            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <main className="bg-background-secondary sm:mt-2 sm:rounded-tl-4xl">
                    <ThemeProvider>{children}</ThemeProvider>
                </main>

                {/* modal sidebar */}
                <ModalSidebar title="Register" isOpen={true}>
                    <div className=""></div>
                </ModalSidebar>
            </div>
        </>
    );
}
