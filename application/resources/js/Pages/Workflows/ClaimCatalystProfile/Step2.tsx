import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface Step3Props {
    stepDetails: any[];
    activeStep: number;
    proposal?: string;
}

const Step2: React.FC<Step3Props> = ({ stepDetails, activeStep, proposal }) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.claimCatalystProfile.index', {
        step: activeStep - 1,
    });
    const {
        connectedWalletProvider,
        isConnecting,
        openConnectWalletSlider,
        extractSignature,
        stakeAddress,
        stakeKey,
        networkName,
    } = useConnectWallet();

    const [isSigning, setIsSigning] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSignature = async () => {
        setIsSigning(true);

        try {
            const signatureResult = await extractSignature(
                t('workflows.catalystDrepSignup.signMessage'),
            );

            if (!signatureResult) {
                return;
            }

            router.post(
                generateLocalizedRoute(
                    'workflows.claimCatalystProfile.signWallet',
                    {
                        proposal
                    }
                ),
                {
                    signature: signatureResult.signature,
                    signature_key: signatureResult.key,
                    stake_key: stakeKey,
                    stakeAddress,
                },
                { onError: (errors) => setError(errors.message) },
            );
        } catch (error) {
            console.error('Error during signature process:', error);
            setError(
                t('workflows.signature.errors.processingError', {
                    details:
                        error instanceof Error
                            ? error.message
                            : t('workflows.signature.errors.unknownError'),
                }),
            );
        } finally {
            setIsSigning(false);
        }
    };

    return (
        <WorkflowLayout
            title="Claim Catalyst Profile"
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background mx-auto my-8 flex h-3/4 w-[calc(100%-4rem)] items-center justify-center rounded-lg p-8 md:w-3/4">
                    <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center rounded-3xl">
                        <div className="space-y-4 text-center">
                            <Title level="2" className="mb-4 font-bold">
                                {t('workflows.signature.signWallet')}
                            </Title>
                            <Paragraph className="mb-6">
                                {t('workflows.signature.signAuth')}
                            </Paragraph>
                            <PrimaryButton
                                onClick={() => handleSignature()}
                                className="w-full text-base lg:px-8 lg:py-2"
                            >
                                {t('workflows.signature.signWallet')}
                            </PrimaryButton>
                        </div>
                    </div>
                    <div
                        className={`bg-danger-light mt-6 transform overflow-hidden rounded-xl py-3 text-center transition-all duration-500 ease-in-out ${
                            error.length
                                ? 'max-w-full translate-x-0 px-6'
                                : 'max-w-0 translate-x-full px-0'
                        }`}
                    >
                        <p className="inline-block min-w-max whitespace-nowrap text-slate-500">
                            {t(error)}
                        </p>
                    </div>
                </div>
            </Content>

            <Footer>
                <PrimaryLink
                    href={prevStep}
                    className="text-sm lg:px-8 lg:py-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('Previous')}</span>
                </PrimaryLink>

                <PrimaryButton
                    className="text-sm lg:px-8 lg:py-2"
                    disabled={isSigning || !stakeAddress}
                    onClick={() => handleSignature()}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step2;
