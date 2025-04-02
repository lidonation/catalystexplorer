import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import RichContent from '@/Components/RichContent';

import { CatalystWhiteLogo } from '@/Components/svgs/CatalystWhiteLogo';
import HelpCircleIcon from '@/Components/svgs/HelpCircleIcon';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WorkflowLayoutProps {
    children: ReactNode;
    asideInfo?: string;
}

export default function WorkflowLayout({
    children,
    asideInfo,
}: WorkflowLayoutProps) {
    const { t } = useTranslation();
    const isLogin = window.location.pathname.endsWith('login');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 sticky z-10 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8">
            <div
                className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="@container relative flex w-full flex-row justify-center">
                    {/* Main Content (Full Width on Small Screens) */}

                    <div className="bg-background relative max-h-[80vh] w-full overflow-auto rounded-lg @lg:w-2/3 @lg:min-w-[400px] @lg:rounded-l-lg">
                        {/* Toggle Button for Small Screens */}

                        <div className="@container relative">
                            {children}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="bg-primary absolute top-0 right-4 text-content-light hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary top-20 right-4 z-5 rounded-full p-2 transition duration-150 ease-in-out lg:hidden"
                            >
                                <HelpCircleIcon />
                            </button>
                            <div className="absolute top-28 right-0 z-10 mx-4 h-full lg:hidden">
                                <div
                                    className={`bg-primary flex h-full flex-col items-center justify-center gap-y-3 overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out lg:hidden ${isOpen ? 'w-full translate-x-0 px-6' : 'max-w-0 translate-x-full px-0'}`}
                                >
                                    <div className="flex h-6 shrink-0 items-center px-8 sm:pt-8">
                                        <CatalystWhiteLogo />
                                    </div>
                                    <div className="mt-6">
                                        <RichContent
                                            className="text-center text-white"
                                            content={
                                                asideInfo &&
                                                (t(asideInfo) as
                                                    | string
                                                    | undefined)
                                            }
                                            format="markdown"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Animated Sidebar for Small Screens */}
                    </div>

                    {/* Sidebar for Large Screens */}
                    <div className="bg-primary hidden h-auto flex-col items-center justify-center gap-y-3 rounded-r-lg px-8 lg:flex lg:w-1/3">
                        <div className="flex h-6 items-center pr-6 sm:pt-8">
                            <CatalystWhiteLogo />
                        </div>
                        <div className="mt-6">
                            <RichContent
                                content={
                                    asideInfo
                                        ? (t(asideInfo) as string | undefined)
                                        : ''
                                }
                                className="text-center text-white"
                                format="markdown"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
