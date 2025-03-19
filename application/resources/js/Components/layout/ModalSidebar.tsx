import useEscapeKey from '@/Hooks/useEscapeKey';
import { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../atoms/Button';
import CatalystLogo from '../atoms/CatalystLogo';
import CloseIcon from '../svgs/CloseIcon';
import Title from '../atoms/Title';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';

type ModalSidebarProps = {
    isOpen?: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
};

function ModalSidebar({ isOpen = false, title, children, onClose }: ModalSidebarProps) {
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const { t } = useTranslation();
    const {isWalletConnectorOpen } = useConnectWallet();

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
            className={`fixed inset-0 z-40 ${isOpen ? 'block' : 'hidden'
                }`}
        >
            {/* Background Overlay */}
            <div
                className="bg-dark fixed inset-0 opacity-50"
                onClick={onClose}
                aria-label={t('navigation.sidebar.close')}
                aria-expanded={isOpen}
                aria-controls="sidebar-modal"
            ></div>

            {/* Sidebar Modal */}
            <div
                className="bg-background fixed top-0 right-0 z-50 h-full w-full shadow-lg focus:outline-hidden sm:w-96"
                tabIndex={0}
            >
                <header className="border-border-primary flex items-center justify-between border-b px-6 py-4">
                    <Title
                        id="modal-sidebar-title"
                        className="text-2 text-content font-semibold"
                    >
                        {title}
                    </Title>
                    <Button
                        onClick={onClose}
                        ariaLabel={t('navigation.sidebar.close')}
                        aria-expanded={isOpen}
                        aria-controls="sidebar-modal"
                        className={`text-4 hover:bg-dark ${!isWalletConnectorOpen ? 'hidden' : ''} items-center rounded-sm px-2 py-1 sm:block lg:inline-flex`}
                    >
                        <CloseIcon width={18} height={18} />
                    </Button>
                </header>

                <div className="flex h-full flex-col gap-6 px-6">
                    <div className="mt-6 hidden h-6 shrink-0 items-center justify-center sm:block lg:flex">
                        <CatalystLogo className="object-contain" />
                    </div>
                    <section>{children}</section>
                </div>
            </div>
        </aside>
    );
}

export default ModalSidebar;
