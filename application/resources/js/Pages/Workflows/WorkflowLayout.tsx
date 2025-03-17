import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import Title from '@/Components/atoms/Title';

import { CatalystWhiteLogo } from '@/Components/svgs/CatalystWhiteLogo';
import TickIcon from '@/Components/svgs/TickIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface WorkflowLayoutProps {
    children: ReactNode;
}

export default function WorkflowLayout({ children }: WorkflowLayoutProps) {
    const { t } = useTranslation();
    const isLogin = window.location.pathname.endsWith('login');
    return (
        <div className="splash-wrapper from-background-home-gradient-color-1 to-background-home-gradient-color-2 sticky -top-64 z-10 flex h-screen justify-center bg-linear-to-r px-8 pb-8 md:rounded-tl-4xl">
            <div
                className="flex h-full w-full flex-col justify-center gap-8 px-8 pt-8 pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="flex w-full flex-row justify-center px-8">
                    <div className="bg-background-lighter w-4/5 rounded-l-lg">
                        <nav className="w-full gap-4 rounded-tl-lg px-8 pt-4">
                            <ul className="menu-gap-y flex w-full pb-3">
                                <li className="flex-1">
                                    <div className="flex gap-2">
                                        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full">
                                            <TickIcon className="text-white" />
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="font-semibold"
                                            >
                                                {t('Title')}
                                            </Title>
                                            <span className="text-slate">
                                                {t('Step 1')}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex-1">
                                    <div className="flex gap-2">
                                        <div className="border-primary text-primary flex h-10 w-10 items-center justify-center rounded-full border">
                                            <span className="">02</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-primary font-semibold"
                                            >
                                                {t('Title')}
                                            </Title>
                                            <span className="text-slate">
                                                {t('Step 2')}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                                <li className="flex-1">
                                    <div className="flex gap-2">
                                        <div className="border-slate text-slate flex h-10 w-10 items-center justify-center rounded-full border">
                                            <span className="">03</span>
                                        </div>
                                        <div>
                                            <Title
                                                level="6"
                                                className="text-slate font-semibold"
                                            >
                                                {t('Title')}
                                            </Title>
                                            <span className="text-slate">
                                                {t('Step 3')}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </nav>
                        <div className="border-primary w-2/3 border-t-3"></div>
                        <div className="h-[600px] overflow-y-auto p-6">{children}</div>
                        {!isLogin && (
                            <footer className="bg-background-lighter w-full">
                                <div className="flex w-full justify-between px-8 pb-8">
                                    <PrimaryButton
                                        className="px-8 py-3 text-sm"
                                        disabled
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span>{t('Previous')}</span>
                                    </PrimaryButton>
                                    <PrimaryButton className="px-8 py-3 text-sm">
                                        <span>{t('Next')}</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </PrimaryButton>
                                </div>
                            </footer>
                        )}
                    </div>
                    <div className="bg-primary flex h-full flex-col items-center justify-center gap-3 rounded-r-lg px-8">
                        <div className="flex h-6 shrink-0 items-center px-8 sm:pt-8">
                            <CatalystWhiteLogo />
                        </div>
                        {/* <div>{'hello'}</div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
