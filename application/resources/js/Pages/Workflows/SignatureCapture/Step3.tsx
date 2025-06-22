import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import Title from '@/Components/atoms/Title';
import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';

import WorkflowLayout from '../WorkflowLayout';
import Nav from '../Partials/WorkflowNav';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';

interface Step3Props {
    stepDetails: any[];
    activeStep: number;
}

const Step3: React.FC<Step3Props> = ({ stepDetails, activeStep }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;

    const prevStep = localizedRoute('workflows.signature.index', {
        step: activeStep - 1,
    });

    const saveWalletName = generateLocalizedRoute(
            'workflows.signature.saveWalletName',
    );

    const [walletName, setWalletName] = useState('');
    const [error, setError] = useState('');

    const handleNext = () => {
        
        router.post(
            saveWalletName,
            { 
                wallet_name: walletName 
            }, 
            {   
                onSuccess: () => {
                    router.visit(localizedRoute('workflows.signature.success'));
            },
                onError: (errors) => {
                    setError(errors.wallet_name || 'An error occurred');
            },
        });
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex items-center justify-center min-h-[60vh] pb-8">
                    <div className="mx-auto max-w-md rounded-lg p-6 text-center">
                        <Title level="4" className="mb-6">
                            {t('workflows.signature.nameWallet')}
                        </Title>

                        <div className="mb-6 relative">
                            <input
                                type="text"
                                placeholder={t('workflows.signature.inputWalletNamePlaceHolder')}
                                value={walletName}
                                onChange={(e) => setWalletName(e.target.value)}
                                className="w-full rounded-md border border-light-gray-persist bg-background p-3 focus:outline-none focus:border-light-gray-persist focus:ring-0"
                            />

                            <div className="flex justify-between mt-1">
                                <Paragraph className="text-xs text-gray-persist">
                                    {t('workflows.signature.walletNameCondition')}
                                </Paragraph>
                            </div>

                            <Paragraph className="text-sm text-gray-persist mt-2">
                                {t('workflows.signature.walletNameDescription')}
                            </Paragraph>

                            {error && (
                                <Paragraph className="text-sm text-slate-500 mt-2">
                                    {error}
                                </Paragraph>
                            )}
                        </div>

                        <PrimaryButton
                            className="w-full py-3"
                            onClick={handleNext}
                            disabled={walletName.trim().length < 6}
                        >
                            {t('buttons.titles.createWallet')}
                        </PrimaryButton>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step3;