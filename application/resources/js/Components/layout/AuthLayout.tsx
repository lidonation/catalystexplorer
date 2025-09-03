import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import LoginImageFive from '@/assets/images/login-image-five.png';
import LoginImageFour from '@/assets/images/login-image-four.png';
import LoginImageOne from '@/assets/images/login-image-one.png';
import LoginImageThree from '@/assets/images/login-image-three.png';
import LoginImageTwo from '@/assets/images/login-image-two.png';
import CatalystLogo from '@/Components/atoms/CatalystLogo';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import Image from '@/Components/Image';
import CatalystEyeIcon from '@/Components/svgs/CatalystEyeIcon';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const { t } = useLaravelReactI18n();

    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center lg:flex-row">
            <div className="bg-background mt-30 mr-54 mb-30 ml-54 inline-flex w-[300px] flex-col items-center justify-start gap-7 rounded-xl p-4 shadow-md sm:w-[400px] lg:w-[700px]">
                <div className="flex justify-center p-3">
                    <CatalystLogo />
                </div>
                {children}
            </div>

            <div className="splash-wrapper from-background-home-gradient-color-1 to-background-home-gradient-color-2 z-10 hidden w-full justify-center bg-gradient-to-r lg:sticky lg:-top-64 lg:order-2 lg:flex lg:h-screen lg:rounded-tl-4xl">
                <div
                    className="relative flex h-full w-full flex-col justify-center overflow-visible lg:gap-8 lg:pt-8"
                    style={{
                        backgroundImage: `url(${ConcentricCircles})`,
                        backgroundPosition: 'top',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <div className="absolute top-0 left-0 p-4 md:p-6 lg:p-10">
                        <CatalystEyeIcon />
                        <Title level="1" className="text-light-persist">
                            {t('app.name')}
                        </Title>
                        <Paragraph className="text-light-persist max-w-md text-base font-normal">
                            {t('authMessage')}
                        </Paragraph>
                    </div>

                    <div className="relative mt-45 overflow-hidden">
                        <div className="flex items-end gap-6">
                            <Image
                                imageUrl={LoginImageOne}
                                className="h-[295.3px] w-[292.67px]"
                            />
                            <Image
                                imageUrl={LoginImageTwo}
                                className="h-[232px] w-[320.67px]"
                            />
                            <Image
                                imageUrl={LoginImageThree}
                                className="h-[464px] w-[461.3px]"
                            />
                        </div>

                        <div className="mt-6 flex gap-6">
                            <Image
                                imageUrl={LoginImageFour}
                                className="h-[481.3px] w-[292.67px]"
                            />
                            <Image
                                imageUrl={LoginImageFive}
                                className="h-[361px] w-[543.5px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
