import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Paragraph from '@/Components/atoms/Paragraph';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';

interface SignatureData {
    stake_key?: string;
    stake_address?: string;
    signature?: string;
    signature_key?: string;
    message?: string;
    wallet_provider?: string;
}

interface Step2Props {
    stepDetails: any[];
    activeStep: number;
    walletData: {
        wallet?: string;
        walletAddress?: string;
        network?: string;
        networkId?: string;
        stake_key?: string;
        stake_address?: string;
    };
    signatureData: SignatureData;
    existingSignatures: any[];
    flash: {
        success?: string;
        error?: string;
    };
}

const Step2: React.FC<Step2Props> = ({
    stepDetails,
    activeStep,
    walletData,
    signatureData,
    existingSignatures,
    flash,
}) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.signature.index', {
        step: activeStep - 1,
    });
    const saveSignatureRoute = generateLocalizedRoute(
        'workflows.signature.saveSignature',
    );

    const generateMessage = () => {
        const timestamp = new Date().toISOString();
        const randomNonce = Math.random().toString(36).substring(2, 10);

        return JSON.stringify({
            type: t('workflows.signature.verification.title'),
            walletAddress: walletData.walletAddress || 'N/A',
            stakeKey: walletData.stake_key || 'N/A',
            network: walletData.network || 'N/A',
            nonce: randomNonce,
            timestamp: timestamp,
        });
    };

    const [message] = useState(generateMessage);
    const [isSigning, setIsSigning] = useState(false);
    const [error, setError] = useState<string | null>(flash?.error || null);
    const [success, setSuccess] = useState<string | null>(
        flash?.success || null,
    );
    const [isComplete, setIsComplete] = useState(!!signatureData?.signature);

    const hasDuplicates = existingSignatures?.length > 1;
    const { extractSignature } = useConnectWallet();

    const handleSignature = async () => {
        setIsSigning(true);
        setError(null);

        try {
            const signatureResult = await extractSignature(message);

            if (!signatureResult) {
                setError(t('workflows.signature.errors.failedToGetSignature'));
                setIsSigning(false);
                return;
            }

            router.post(
                saveSignatureRoute,
                {
                    signature: signatureResult.signature,
                    signature_key: signatureResult.key,
                    message: message,
                },
                {
                    onSuccess: (page) => {
                        interface FlashData {
                            success?: string;
                            error?: string;
                        }
                        const flashData: FlashData = page.props.flash || {};
                        if (flashData.success) {
                            setSuccess(flashData.success);
                            setError(null);
                        } else if (flashData.error) {
                            setError(flashData.error);
                            setSuccess(null);
                        }
                        setIsComplete(true);
                    },
                    onError: (errors) => {
                        console.error('Signature errors:', errors);
                        setError(
                            t(
                                'workflows.signature.errors.failedToSaveSignature',
                                {
                                    details: Object.values(errors).join(', '),
                                },
                            ),
                        );
                    },
                    onFinish: () => {
                        setIsSigning(false);
                    },
                },
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
            setIsSigning(false);
        }
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-3xl">
                    <div className="rounded-lg p-6">
                        <Title level="4" className="mb-6 text-center">
                            {t('workflows.signature.signWallet')}
                        </Title>
                        <>
                            <div className="mx-auto max-w-sm text-center">
                                <Paragraph className="text-gray-persist mb-4">
                                    {t('workflows.signature.signAuth')}
                                </Paragraph>

                                <PrimaryButton
                                    className="mt-4 w-full py-3"
                                    onClick={handleSignature}
                                    disabled={isSigning}
                                >
                                    {isSigning ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2
                                                size={16}
                                                className="mr-2 animate-spin"
                                            />
                                            {t('workflows.signature.signing')}
                                        </div>
                                    ) : (
                                        t('workflows.signature.signMessage')
                                    )}
                                </PrimaryButton>

                                {error && (
                                    <div
                                        className={`bg-danger-light container mt-6 transform overflow-hidden rounded-lg py-3 text-center transition-all duration-500 ease-in-out ${
                                            error.length
                                                ? 'border-danger-strong max-w-full translate-x-0 border px-6'
                                                : 'max-w-0 translate-x-full px-0'
                                        }`}
                                    >
                                        <p className="inline-block text-slate-500 lg:min-w-max lg:whitespace-nowrap">
                                            {t(error)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
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

export default Step2;
