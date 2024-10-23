import { ReactNode, useState } from 'react';
import CatalystLogo from '../atoms/CatalystLogo';
import CloseIcon from '../svgs/CloseIcon';
type ModalSidebarProps = {
    isOpen?: boolean;
    title: string;
    children: ReactNode;
};
function ModalSidebar({ isOpen, title, children }: ModalSidebarProps) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(isOpen);
    return (
        <section className={`${isSideBarOpen ? 'block' : 'hidden'}`}>
            <div
                className="fixed inset-0 z-40"
                style={{
                    background:
                        'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5))',
                }}
                onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            ></div>

            <div className="fixed right-0 top-0 z-50 h-full w-full bg-background-primary shadow-lg sm:w-96">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <p className="text-lg font-semibold text-content-primary">{title}</p>
                    <button
                        className="inline-flex items-center rounded p-2 text-sm hover:bg-gray-100"
                        onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                    >
                        <CloseIcon width={14} height={14} />
                    </button>
                </div>
                <div className="flex h-full flex-col gap-6 px-6">
                    <div className="mt-6 flex h-6 shrink-0 items-center justify-center px-6">
                        <CatalystLogo className="object-contain" />
                    </div>

                    {children}
                </div>
            </div>
        </section>
    );
}

export default ModalSidebar;
