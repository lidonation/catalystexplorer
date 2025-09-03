import ErrorDisplay from '@/Components/atoms/ErrorDisplay';
import PrimaryButton from '@/Components/atoms/PrimaryButton';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import SecondaryButton from '@/Components/atoms/SecondaryButton';
import Image from '@/Components/Image';
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
import CatalysDrepData = App.DataTransferObjects.CatalystDrepData;

interface SignatureData {
    stake_key?: string;
    stake_address?: string;
    signature?: string;
    signature_key?: string;
    message?: string;
    wallet_provider?: string;
}

interface Step3Props {
    stepDetails: any[];
    activeStep: number;
    catalystDrep: string;
}

const Step3: React.FC<Step3Props> = ({
    stepDetails,
    activeStep,
    catalystDrep,
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.drepSignUp.index', {
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
                    'workflows.drepSignUp.captureSignature',
                    {
                        catalystDrep,
                    },
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
            title="Drep SignUp"
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
            disclaimer={t('workflows.voterList.prototype')}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="bg-background-lighter mx-auto w-full max-w-md rounded-3xl p-6 shadow-md">
                    <ErrorDisplay />
                    <div className="space-y-4">
                        <SecondaryButton
                            className={`hover:bg-background-lighter flex w-full items-center justify-center gap-2 rounded-md px-4 py-1.5 text-sm sm:text-base`}
                            icon={
                                connectedWalletProvider && (
                                    <Image
                                        imageUrl={connectedWalletProvider?.icon}
                                        size="w-6 h-6"
                                        className="rounded-full"
                                        alt={`${connectedWalletProvider?.name || 'Wallet'} icon`}
                                    />
                                )
                            }
                            iconPosition={'left'}
                            type="button"
                            disabled={!!isConnecting}
                            onClick={() => {
                                if (!connectedWalletProvider) {
                                    openConnectWalletSlider();
                                }
                            }}
                        >
                            {connectedWalletProvider
                                ? t('wallet.status.connected')
                                : isConnecting
                                  ? t('wallet.status.connecting')
                                  : t('wallet.connect.title')}
                        </SecondaryButton>

                        <div className="border-slate border-t border-dashed"></div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500">
                                {t('users.network')}
                            </span>
                            <span className="font-medium">{networkName}</span>
                        </div>

                        <div className="border-slate border-t border-dashed"></div>

                        <div className="flex items-center justify-between py-2">
                            <span className="text-slate-500">
                                {t('Message')}
                            </span>
                            <span className="font-medium">
                                {t(
                                    'workflows.catalystDrepSignup.signMessageInfo',
                                )}
                            </span>
                        </div>

                        <div className="bg-primary-light mt-6 rounded-xl p-4 text-center">
                            <p className="text-slate-500">
                                {t('workflows.catalystDrepSignup.signMessage')}
                            </p>
                        </div>
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
                    loading={isSigning}
                    onClick={() => handleSignature()}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryButton>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step3;
