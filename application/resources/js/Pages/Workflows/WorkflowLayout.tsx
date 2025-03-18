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
    asideInfo?:string;
}

export default function WorkflowLayout({ children,asideInfo }: WorkflowLayoutProps) {
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
                    <div className="bg-background w-4/5 rounded-l-lg">
                        {children}
                        {/* nav */}
                    
                        {/* <div className="h-[600px] overflow-y-auto p-6">{children}</div> */}
                    </div>

                    <div className="bg-primary flex h-full flex-col items-center justify-center gap-3 rounded-r-lg px-8">
                        <div className="flex h-6 shrink-0 items-center px-8 sm:pt-8">
                            <CatalystWhiteLogo />
                        </div>
                        <div>{asideInfo}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
