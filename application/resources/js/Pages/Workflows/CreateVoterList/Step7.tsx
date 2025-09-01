import {
    generateLocalizedRoute,
    useLocalizedRoute,
} from '@/utils/localizedRoute';
import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import {useLaravelReactI18n} from "laravel-react-i18n";

import PrimaryLink from '@/Components/atoms/PrimaryLink';
import Title from '@/Components/atoms/Title';
import ConnectWalletButton from '@/Components/ConnectWalletButton';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import WorkflowLayout from '../WorkflowLayout';
import { StepDetails } from '@/types';

interface Step7Props {
    stepDetails: StepDetails[];
    activeStep: number;
    bookmarkHash: string;
}

const Step7: React.FC<Step7Props> = ({
    stepDetails,
    activeStep,
    bookmarkHash,
}) => {
    const { t } = useLaravelReactI18n();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep - 1,
        bk: bookmarkHash,
    });
    const nextStep = localizedRoute('workflows.createVoterList.index', {
        step: activeStep + 1,
        bk: bookmarkHash,
    });

    const {
        connectedWalletProvider,
        userAddress,
        stakeKey,
        stakeAddress,
        openConnectWalletSlider,
        networkName,
        networkId,
        extractSignature,
    } = useConnectWallet();

    const handleSubmit = async () => {
        if (!connectedWalletProvider || !userAddress) {
            console.error('Wallet not connected');
            return;
        }
        try {
            // Create a message to sign (typically containing voting information)
            const messageToSign = JSON.stringify({
                voter: userAddress,
                stakeKey: stakeKey,
                stakeAddress: stakeAddress,
                timestamp: new Date().toISOString(),
            });

            // Extract signature using the wallet
            const signatureResult = await extractSignature(messageToSign);

            if (!signatureResult) {
                console.error('Failed to get signature');
                return;
            }
            router.post(
                generateLocalizedRoute('workflows.createVoterList.signBallot'),
                {
                    wallet: connectedWalletProvider?.name || '',
                    walletAddress: userAddress,
                    stake_key: stakeKey,
                    stakeAddress: stakeAddress,
                    signature: signatureResult.signature,
                    signature_key: signatureResult.key,
                    bk: bookmarkHash,
                },
                {
                    onSuccess: () => {
                        router.visit(nextStep);
                    },
                    onError: (errors) => {
                        console.error('Wallet connection errors:', errors);
                    },
                },
            );
        } catch (error) {
            console.error('Error during signature process:', error);
        }
    };

    return (
        <WorkflowLayout
            title="Create Voter List"
            asideInfo={stepDetails[activeStep - 1]?.info || ''}
        >
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="mx-auto w-full max-w-3xl">
                    <div className="flex flex-col items-center justify-center rounded-lg p-6">
                        <Title
                            level="4"
                            className="text-content mb-8 text-center font-bold"
                        >
                            {t('Connect Wallet')}
                        </Title>

                        <div className="w-full max-w-md space-y-4">
                            <ConnectWalletButton
                                className="w-full justify-center py-3"
                                onClick={openConnectWalletSlider}
                            />
                        </div>
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
                <PrimaryLink
                    href={nextStep}
                    className="text-sm lg:px-8 lg:py-3"
                    disabled={!connectedWalletProvider}
                    onClick={(e) => {
                        e.preventDefault();
                        if (connectedWalletProvider) {
                            handleSubmit();
                        }
                    }}
                >
                    <span>{t('Next')}</span>
                    <ChevronRight className="h-4 w-4" />
                </PrimaryLink>
            </Footer>
        </WorkflowLayout>
    );
};

export default Step7;
