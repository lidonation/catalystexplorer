import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import RichContent from '@/Components/RichContent';

import { CatalystWhiteLogo } from '@/Components/svgs/CatalystWhiteLogo';
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
                <div className="flex w-full flex-row justify-center lg:px-8">
                    {/* Main Content (Full Width on Small Screens) */}
                    <div className="bg-background min-h-[600px] w-full overflow-visible rounded-lg lg:container lg:w-2/3 lg:min-w-[400px] lg:rounded-l-lg">
                        {children}

                        {/* Toggle Button for Small Screens */}
                        {/* <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="bg-primary absolute top-4 right-4 z-50 rounded-md px-3 py-2 text-white shadow-md lg:hidden"
                        >
                            {isOpen ? 'Close' : 'Info'}
                        </button> */}

                        {/* Animated Sidebar for Small Screens */}
                        <div
                            className={`bg-primary absolute top-0 right-0 flex h-full w-0 flex-col items-center justify-center gap-y-3 overflow-hidden shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-full px-6' : 'max-w-0 px-0'} rounded-r-lg lg:hidden`}
                        >
                            <div className="flex h-6 shrink-0 items-center px-8 sm:pt-8">
                                <CatalystWhiteLogo />
                            </div>
                            <div className="mt-6">
                                <p className="text-content-light text-center">
                                    <RichContent
                                        content={
                                            asideInfo &&
                                            (t(asideInfo) as string | undefined)
                                        }
                                        format="markdown"
                                    />
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar for Large Screens */}
                    <div className="bg-primary hidden h-auto flex-col items-center justify-center gap-y-3 rounded-r-lg px-8 lg:flex lg:w-1/3">
                        <div className="flex h-6 items-center pr-6 sm:pt-8">
                            <CatalystWhiteLogo />
                        </div>
                        <div className="mt-6">
                            <RichContent
                                content={
                                    asideInfo &&
                                    (t(asideInfo) as string | undefined)
                                }
                                className="text-center"
                                format="markdown"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
