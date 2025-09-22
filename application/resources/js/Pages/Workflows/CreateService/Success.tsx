import ConcentricCircles from '@/assets/images/bg-concentric-circles.png';
import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import { VerificationBadge } from '@/Components/svgs/VerificationBadge';
import { generateLocalizedRoute } from '@/utils/localizedRoute';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import React from 'react';

interface ServiceSuccessProps {
    service: App.DataTransferObjects.ServiceData;
    isEdited?: boolean;
}

const Success: React.FC<ServiceSuccessProps> = ({ service, isEdited }) => {
    const { t } = useLaravelReactI18n();

    const handleViewPublicListing = () => {
        window.open(
            generateLocalizedRoute('services.show', {
                service: service.id,
            }),
            '_blank'
        );
    };

    const handleGoToMyServices = () => {
         window.open(
            generateLocalizedRoute('my.services'),
            '_blank'
        );
      
    };

    return (
        <div
            className="splash-wrapper lg:from-background-home-gradient-color-1 lg:to-background-home-gradient-color-2 sticky z-10 -mb-4 flex justify-center md:rounded-tl-4xl lg:-top-64 lg:h-screen lg:bg-linear-to-r lg:px-8 lg:pb-8"
            data-testid="service-success-page-wrapper"
        >
            <div
                className="flex h-full w-full flex-col justify-center lg:gap-8 lg:px-8 lg:pt-8 lg:pb-4"
                style={{
                    backgroundImage: `url(${ConcentricCircles})`,
                    backgroundPosition: 'top',
                    backgroundRepeat: 'no-repeat',
                }}
                data-testid="service-success-background-container"
            >
                <div
                    className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4"
                    data-testid="service-success-content-wrapper"
                >
                    <div
                        className="flex h-full w-full flex-col items-center justify-center rounded p-8 md:w-3/4 md:shadow-sm"
                        data-testid="service-success-main-content"
                    >
                        <Title
                            level="4"
                            className="mx-4 mb-7 text-center font-bold"
                            data-testid="service-success-title"
                        >
                            {!isEdited ? t('workflows.createService.success.title') : t('workflows.createService.success.titleEdited')}
                        </Title>
                        <VerificationBadge
                            size={80}
                            data-testid="service-verification-badge"
                        />

                        {/* Service Details */}
                        <div
                            className="mt-8 max-w-full text-center"
                            data-testid="service-details-container"
                        >
                            <Paragraph
                                className="text-primary mb-4 text-xl font-semibold"
                                data-testid="service-title-display"
                            >
                                {service.title}
                            </Paragraph>
                            <Paragraph
                                className="text-gray-persist mb-6 text-base"
                                data-testid="service-success-message"
                            >
                                {t('workflows.createService.success.message')}
                            </Paragraph>
                        </div>

                        {/* Action Buttons */}
                        <div
                            className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-6"
                            data-testid="service-success-actions"
                        >
                            <PrimaryButton
                                onClick={handleViewPublicListing}
                                className="px-6 py-3"
                                data-testid="view-public-listing-button"
                            >
                                {t('workflows.createService.success.viewPublicListing')}
                            </PrimaryButton>
                            <PrimaryButton
                                onClick={handleGoToMyServices}
                                className="px-6 py-3"
                                data-testid="go-to-my-services-button"
                            >
                                {t('workflows.createService.success.goToMyServices')}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Success;
