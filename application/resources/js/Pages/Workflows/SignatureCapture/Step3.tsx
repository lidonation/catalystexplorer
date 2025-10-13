import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';

import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';

import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step3Props {
    stepDetails: any[];
    activeStep: number;
}

const Step3: React.FC<Step3Props> = ({ stepDetails, activeStep }) => {
    const { t } = useLaravelReactI18n();
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
                wallet_name: walletName,
            },
            {
                onSuccess: () => {
                    router.visit(localizedRoute('workflows.signature.success'));
                },
                onError: (errors) => {
                    setError(errors.wallet_name || 'An error occurred');
                },
            },
        );
    };

    return (
        <WorkflowLayout
            title="Register Signature"
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="flex min-h-[60vh] items-center justify-center pb-8">
                    <div className="mx-auto max-w-md rounded-lg p-6 text-center">
                        <Title level="4" className="mb-6">
                            {t('workflows.signature.nameWallet')}
                        </Title>

                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder={t(
                                    'workflows.signature.inputWalletNamePlaceHolder',
                                )}
                                value={walletName}
                                onChange={(e) => setWalletName(e.target.value)}
                                className="border-light-gray-persist bg-background focus:border-light-gray-persist w-full rounded-md border p-3 focus:ring-0 focus:outline-none"
                            />

                            <div className="mt-1 flex justify-between">
                                <Paragraph className="text-gray-persist text-xs">
                                    {t(
                                        'workflows.signature.walletNameCondition',
                                    )}
                                </Paragraph>
                            </div>

                            <Paragraph className="text-gray-persist mt-2 text-sm">
                                {t('workflows.signature.walletNameDescription')}
                            </Paragraph>

                            {error && (
                                <Paragraph className="mt-2 text-sm text-slate-500">
                                    {error}
                                </Paragraph>
                            )}
                        </div>

                        <PrimaryButton
                            className="w-full py-3"
                            onClick={handleNext}
                            disabled={walletName.trim().length < 6}
                        >
                            {t('workflows.linkWallet.linkWallet')}
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
