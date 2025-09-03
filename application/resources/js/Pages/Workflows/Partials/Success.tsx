import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ReactNode } from 'react';

interface SuccessComponentProps {
    titleKey: string;
    messageKey: string;
    badgeSize?: number;
    action?: ReactNode;
}

export default function SuccessComponent({
    titleKey,
    messageKey,
    badgeSize = 80,
    action,
}: SuccessComponentProps) {
    const { t } = useLaravelReactI18n();

    return (
        <div className="splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 sticky z-10 -mb-4 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8">
            <div
                className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm">
                        <Title level="4" className="mx-4 text-center font-bold">
                            {t(titleKey)}
                        </Title>
                        <VerificationBadge size={badgeSize} />
                        <Paragraph
                            size="sm"
                            className="text-gray-persist mt-4 text-center"
                        >
                            {t(messageKey)}
                        </Paragraph>
                        {action && <div className="mt-8">{action}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
