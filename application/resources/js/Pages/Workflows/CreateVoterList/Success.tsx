import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Success() {

    const { t } = useTranslation();

    return (
        <div className="splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 sticky z-10 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8 -mb-4">
            <div
                className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="flex w-[calc(100%-4rem)] my-8 mx-auto md:w-3/4 h-3/4 items-center justify-center bg-background rounded-lg p-8">
                    <div className="flex flex-col w-full h-full md:w-3/4 items-center justify-center rounded md:shadow-sm p-8">
                        <Title level="4" className="font-bold text-center mx-4">
                            {t('workflows.voterList.success.title')}
                        </Title>
                        <VerificationBadge size={80} />
                        <Paragraph size="sm" className="text-center mt-4 text-gray-persist">
                            {t('workflows.voterList.success.message')}
                        </Paragraph>
                    </div>
                </div>
            </div>
        </div>
    );
}
