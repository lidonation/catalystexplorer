import Title from '@/Components/atoms/Title';
import { BackArrow } from '@/Components/svgs/BackArrow';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

const CatalystProfileSubmittedCard: React.FC = () => {
    const { t } = useLaravelReactI18n();

    return (
        <div className="bg-background mx-auto max-w-md rounded-lg p-8 text-center shadow-lg">
            <div className="space-y-6">
                <a href="#" className="text-primary 0 mb-6 flex items-center">
                    <BackArrow />
                    {t('back')}
                </a>

                <Title className="mb-8 text-2xl font-black">
                    {t('verificationTitle')}
                </Title>

                <div className="mb-8 flex justify-center">
                    <VerificationBadge />
                </div>

                <div className="space-y-0">
                    <div className="text-gray-600">
                        {t('verificationCodeLabel')}
                    </div>
                    <div className="text-primary text-2xl font-bold">
                        {t('verificationCode')}8vklg
                    </div>
                </div>

                <p className="my-6 text-sm text-gray-600">
                    {t('verificationInstructions')}
                </p>

                <a
                    href="#"
                    className="bg-primary inline-block w-full rounded-md px-4 py-3 text-center text-white transition-colors"
                >
                    {t('goToIdeascale')}
                </a>
            </div>
        </div>
    );
};

export default CatalystProfileSubmittedCard;
