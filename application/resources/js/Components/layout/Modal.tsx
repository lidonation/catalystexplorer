import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import useEscapeKey from '@/Hooks/useEscapeKey';
import { ReactNode, useEffect, useRef } from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";
import Button from '../atoms/Button';
import CatalystLogo from '../atoms/CatalystLogo';
import Title from '../atoms/Title';
import CloseIcon from '../svgs/CloseIcon';

type ModalProps = {
    isOpen?: boolean;
    title: string;
    children: ReactNode;
    onClose: () => void;
    centered?: boolean;
    logo?: boolean;
    contentClasses?: string;
};

function Modal({
    isOpen = false,
    title,
    children,
    onClose,
    centered = false,
    logo = true,
   contentClasses = 'max-w-md'
}: ModalProps) {
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const { t } = useLaravelReactI18n();
    const { isWalletConnectorOpen } = useConnectWallet();

    useEscapeKey(() => onClose());

    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            const originalPaddingRight = document.body.style.paddingRight;
            const scrollBarWidth =
                window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;

            return () => {
                document.body.style.overflow = originalOverflow;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }
    }, [isOpen]);

    return (
        <aside
            id="sidebar-modal"
            role="dialog"
            aria-labelledby="modal-sidebar-title"
            aria-modal="true"
            ref={sidebarRef}
            className={`fixed inset-0 z-60 ${isOpen ? 'block' : 'hidden'}`}
        >
            {/* Background Overlay */}
            <div
                className="bg-dark fixed inset-0 opacity-50"
                onClick={onClose}
                aria-label={t('navigation.sidebar.close')}
                aria-expanded={isOpen}
                aria-controls="sidebar-modal"
            ></div>

            {/* Sidebar or Centered Modal */}
            <div
                className={`bg-background fixed z-50 shadow-lg focus:outline-hidden ${
                    centered
                        ? `top-1/2 left-1/2 h-auto w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-lg ${contentClasses}`
                        : 'top-0 right-0 h-full min-w-[24rem] lg:ml-auto'
                }`}
                tabIndex={0}
            >
                {!centered && (
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
                            className={`text-4 hover:bg-dark ${
                                !isWalletConnectorOpen ? 'hidden' : ''
                            } inline-flex items-center rounded-sm px-2 py-1 sm:block`}
                        >
                            <CloseIcon width={18} height={18} />
                        </Button>
                    </header>
                )}

                <div className="flex h-full flex-col gap-6 px-6">
                    {logo && (
                        <div className="mt-6 hidden h-6 shrink-0 items-center justify-center sm:block lg:flex">
                            <CatalystLogo className="object-contain" />
                        </div>
                    )}
                    <section>{children}</section>
                </div>
            </div>
        </aside>
    );
}
export default Modal;
