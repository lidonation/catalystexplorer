import React from 'react';
import { useTranslation } from 'react-i18next';
import { BackArrow } from '@/Components/svgs/BackArrow';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import Title from '@/Components/atoms/Title';

const IdeascaleProfileSubmittedCard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto p-8 text-center bg-background rounded-lg shadow-lg">
      <div className="space-y-6">
        <a href="#" className="text-primary 0 flex items-center mb-6">
          <BackArrow />
          {t('back')}
        </a>

        <Title className="text-2xl font-black mb-8">{t('verificationTitle')}</Title>

        <div className="flex justify-center mb-8">
          <VerificationBadge />
        </div>

        <div className="space-y-0">
          <div className="text-gray-600">{t('verificationCodeLabel')}</div>
          <div className="text-2xl text-primary font-bold">{t('verificationCode')}8vklg</div>
        </div>

        <p className="text-gray-600 text-sm my-6">
          {t('verificationInstructions')}
        </p>

        <a href="#" className="w-full inline-block bg-primary text-white py-3 px-4 rounded-md transition-colors text-center">
          {t('goToIdeascale')}
        </a>
      </div>
    </div>
  );
};

export default IdeascaleProfileSubmittedCard;
