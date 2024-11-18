import useEscapeKey from '@/Hooks/useEscapeKey';
import { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../atoms/Button';
import CatalystLogo from '../atoms/CatalystLogo';
import CloseIcon from '../svgs/CloseIcon';

type ModalSidebarProps = {
    isOpen?: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
};

function ModalSidebar({ isOpen = false, title, children, onClose }: ModalSidebarProps) {
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();

    useEscapeKey(() => onClose());

    useEffect(() => {
        if (isOpen && sidebarRef.current) {
            sidebarRef.current.focus();
        }
    }, [isOpen]);

    return (
        <aside
            id="sidebar-modal"
            role="dialog"
            aria-labelledby="modal-sidebar-title"
            aria-modal="true"
            ref={sidebarRef}
            className={`${isOpen ? 'block' : 'hidden'} fixed inset-0 z-40`}
        >
            {/* Background Overlay */}
            <div
                className="fixed inset-0 bg-dark opacity-50"
                onClick={onClose}
                aria-label={t('navigation.sidebar.close')}
                aria-expanded={isOpen}
                aria-controls="sidebar-modal"
            ></div>

            {/* Sidebar Modal */}
            <div
                className="fixed right-0 top-0 z-50 h-full w-full bg-background shadow-lg focus:outline-none sm:w-96"
                tabIndex={0}
            >
                <header className="flex items-center justify-between border-b border-border-primary px-6 py-4">
                    <h2
                        id="modal-sidebar-title"
                        className="text-lg font-semibold text-content"
                    >
                        {title}
                    </h2>
                    <Button
                        onClick={onClose} 
                        ariaLabel={t('navigation.sidebar.close')}
                        aria-expanded={isOpen}
                        aria-controls="sidebar-modal"
                        className="inline-flex items-center rounded px-2 py-1 text-sm hover:bg-dark"
                    >
                        <CloseIcon width={18} height={18} />
                    </Button>
                </header>

                <div className="flex h-full flex-col gap-6 px-6">
                    <div className="mt-6 flex h-6 shrink-0 items-center justify-center px-6">
                        <CatalystLogo className="object-contain" />
                    </div>
                    <section className="overflow-y-auto">{children}</section>
                </div>
            </div>
        </aside>
    );
}

export default ModalSidebar;
