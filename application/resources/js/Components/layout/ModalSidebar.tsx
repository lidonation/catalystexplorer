import useEscapeKey from '@/Hooks/useEscapeKey';
import { ReactNode, useEffect, useRef, useState } from 'react';
import CatalystLogo from '../atoms/CatalystLogo';
import CloseIcon from '../svgs/CloseIcon';

type ModalSidebarProps = {
    isOpen?: boolean;
    title: string;
    children: ReactNode;
};

function ModalSidebar({ isOpen = false, title, children }: ModalSidebarProps) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(isOpen);
    const sidebarRef = useRef<HTMLDivElement | null>(null);

    useEscapeKey(() => setIsSideBarOpen(false));

    // Focus trap for accessibility
    useEffect(() => {
        if (isSideBarOpen && sidebarRef.current) {
            sidebarRef.current.focus();
        }
    }, [isSideBarOpen]);

    return (
        <aside
            role="dialog"
            aria-modal="true"
            ref={sidebarRef}
            className={`${isSideBarOpen ? 'block' : 'hidden'} fixed inset-0 z-40`}
        >
            {/* Background Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={() => setIsSideBarOpen(false)}
                aria-hidden="true"
            ></div>

            {/* Sidebar Modal */}
            <div
                className="fixed right-0 top-0 z-50 h-full w-full bg-background-primary shadow-lg focus:outline-none sm:w-96"
                aria-labelledby="modal sidebar"
                tabIndex={0}
            >
                <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2
                        id="modal-sidebar-title"
                        className="text-lg font-semibold text-content-primary"
                    >
                        {title}
                    </h2>
                    <button
                        className="inline-flex items-center rounded p-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsSideBarOpen(false)}
                        aria-label="close sidebar"
                    >
                        <CloseIcon width={14} height={14} />
                    </button>
                </header>

                <div className="flex h-full flex-col gap-6 px-6">
                    <div className="mt-6 flex h-6 shrink-0 items-center justify-center px-6">
                        <CatalystLogo className="object-contain" />
                    </div>
                    <section
                        aria-describedby="modal sidebar content."
                        className="overflow-y-auto"
                    >
                        {children}
                    </section>
                </div>
            </div>
        </aside>
    );
}

export default ModalSidebar;
