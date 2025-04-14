import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';
import { generateLocalizedRoute, useLocalizedRoute } from '@/utils/localizedRoute';

import Paragraph from '@/Components/atoms/Paragraph';
import Title from '@/Components/atoms/Title';
import PrimaryLink from '@/Components/atoms/PrimaryLink';
import WorkflowLayout from '../WorkflowLayout';
import Content from '../Partials/WorkflowContent';
import Footer from '../Partials/WorkflowFooter';
import Nav from '../Partials/WorkflowNav';
import ConnectWalletButton from '@/Components/ConnectWalletButton';
import { useConnectWallet } from '@/Context/ConnectWalletSliderContext';

import { VoteEnum } from '@/enums/votes-enums';
import { StepDetails } from '@/types';

interface ProposalType {
    slug: string;
    title: string;
    fund?: {
        title: string;
    };
    requested_funds?: string;
}

interface Step3Props {
    stepDetails: StepDetails[];
    activeStep: number;
    selectedProposals?: ProposalType[];
    votes?: Record<string, VoteEnum>;
}

const Step3: React.FC<Step3Props> = ({
                                         stepDetails,
                                         activeStep,
                                         selectedProposals = [],
                                         votes = {}
                                     }) => {
    const { t } = useTranslation();
    const localizedRoute = useLocalizedRoute;
    const prevStep = localizedRoute('workflows.voting.index', { step: activeStep - 1 });
    const nextStep = localizedRoute('workflows.voting.index', { step: activeStep + 1 });

    const {
        connectedWalletProvider,
        userAddress,
        stakeKey,
        openConnectWalletSlider,
        networkName,
        networkId,
        extractSignature
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
                proposals: selectedProposals.map(p => p.slug),
                votes: votes,
                timestamp: new Date().toISOString()
            });

            // Extract signature using the wallet
            const signatureResult = await extractSignature(messageToSign);

            if (!signatureResult) {
                console.error('Failed to get signature');
                return;
            }
            router.post(generateLocalizedRoute('workflows.voting.signBallot'), {
                wallet: connectedWalletProvider?.name || '',
                walletAddress: userAddress,
                network: networkName,
                networkId: networkId ? String(networkId) : null,
                stake_key: stakeKey,
                signature: signatureResult.signature,
                signature_key: signatureResult.key,
                message: messageToSign
            }, {
                onSuccess: () => {
                    router.visit(nextStep);
                },
                onError: (errors) => {
                    console.error('Wallet connection errors:', errors);
                }
            });
        } catch (error) {
            console.error('Error during signature process:', error);
        }
    };

    return (
        <WorkflowLayout asideInfo={stepDetails[activeStep - 1]?.info || ''}>
            <Nav stepDetails={stepDetails} activeStep={activeStep} />

            <Content>
                <div className="max-w-3xl mx-auto w-full">
                    <div className="p-6 rounded-lg flex flex-col items-center justify-center">
                        <Title level="4" className="mb-8 text-content font-bold text-center">{t('Connect Wallet')}</Title>

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

export default Step3;
