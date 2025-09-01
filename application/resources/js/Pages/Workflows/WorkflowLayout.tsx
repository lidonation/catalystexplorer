import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import RichContent from '@/Components/RichContent';
import { CatalystWhiteLogo } from '@/Components/svgs/CatalystWhiteLogo';
import HelpCircleIcon from '@/Components/svgs/HelpCircleIcon';
import WorkflowSlideOver from '@/Components/WorkflowSlideOver';
import { Head } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode, useState } from 'react';

interface WorkflowSlideOverConfig {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    content: ReactNode;
}

interface WorkflowLayoutProps {
    children: ReactNode;
    asideInfo?: string;
    wrapperClassName?: string;
    contentClassName?: string;
    slideOver?: WorkflowSlideOverConfig;
    title: string;
    disclaimer?: string;
}

export default function WorkflowLayout({
    children,
    asideInfo,
    wrapperClassName,
    contentClassName,
    slideOver,
    title,
    disclaimer,
}: WorkflowLayoutProps) {
    const { t } = useLaravelReactI18n();
    const isLogin = window.location.pathname.endsWith('login');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Head title={title} />
            <div
                className={`splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 relative sticky z-10 -mb-4 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8 ${wrapperClassName || ''}`}
            >
                <div
                    className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                    style={{
                        backgroundImage: `url(${ConcentricCircles})`,
                        backgroundPosition: 'top',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="relative flex min-h-full w-full flex-row justify-center">
                        {/* Main Content (Full Width on Small Screens) */}

                        <div
                            className={`bg-background relative h-full w-full overflow-auto rounded-lg lg:overflow-y-auto @lg:w-2/3 @lg:min-w-[400px] @lg:rounded-l-lg ${contentClassName || ''}`}
                        >
                            <div className="relative h-full">
                                {children}
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="bg-primary text-content-light hover:bg-background-tertiary hover:text-content-secondary focus:bg-background-accent active:bg-background-tertiary absolute top-20 right-4 z-5 rounded-full p-2 transition duration-150 ease-in-out lg:hidden"
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
                                        <div className="mt-6">
                                            <RichContent
                                                className="text-center text-white"
                                                content={
                                                    disclaimer &&
                                                    (t(disclaimer) as
                                                        | string
                                                        | undefined)
                                                }
                                                format="html"
                                            />
                                        </div>
                                    </div>
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
                                        asideInfo
                                            ? (t(asideInfo) as
                                                  | string
                                                  | undefined)
                                            : ''
                                    }
                                    className="text-center text-white"
                                    format="markdown"
                                />
                            </div>
                            <div className="mt-6">
                                <RichContent
                                    className="text-center text-white"
                                    content={
                                        disclaimer &&
                                        (t(disclaimer) as string | undefined)
                                    }
                                    format="html"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slide Over Content */}
                {slideOver && (
                    <WorkflowSlideOver
                        isOpen={slideOver.isOpen}
                        onClose={slideOver.onClose}
                        title={slideOver.title}
                        size={slideOver.size}
                    >
                        {slideOver.content}
                    </WorkflowSlideOver>
                )}
            </div>
        </>
    );
}
